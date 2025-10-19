package main

import (
	"net/http"
	"time"

	"github.com/Har2yQn78/social_back.git/internal/store"
	"github.com/golang-jwt/jwt/v5" 
	"github.com/google/uuid"
	"errors"
)

// RegisterUserPayload defines the expected JSON structure for a registration request.
// The `validate` tags are used by our validator library.
type RegisterUserPayload struct {
	Username string `json:"username" validate:"required,max=100"`
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=3,max=72"`
}

// registerUserHandler is our HTTP handler for user creation.
func (app *application) registerUserHandler(w http.ResponseWriter, r *http.Request) {
    var payload RegisterUserPayload
    if err := readJSON(w, r, &payload); err != nil { app.badRequestResponse(w, r, err); return }
    if err := Validate.Struct(payload); err != nil { app.badRequestResponse(w, r, err); return }

    user := &store.User{Username: payload.Username, Email: payload.Email}
    if err := user.Password.Set(payload.Password); err != nil { app.internalServerError(w, r, err); return }

    plainToken := uuid.New().String()

    err := app.store.Users.CreateAndInvite(r.Context(), user, plainToken, time.Hour*24*3)
    if err != nil {
        switch {
        case errors.Is(err, store.ErrDuplicateEmail), errors.Is(err, store.ErrDuplicateUsername):
            app.badRequestResponse(w, r, err)
        default:
            app.internalServerError(w, r, err)
        }
        return
    }

    go func() {
        defer func() {
            if r := recover(); r != nil {
                app.logger.Errorw("recovered in send email goroutine", "panic", r)
            }
        }()
        data := map[string]any{
            "activationURL": "http://localhost:8080/v1/users/activate/" + plainToken,
            "username":      user.Username,
        }
        if err := app.mailer.Send(user.Email, "user_welcome.tmpl", data); err != nil {
            app.logger.Errorw("failed to send welcome email", "error", err)
        }
    }()

    app.jsonResponse(w, http.StatusAccepted, map[string]string{"message": "please check your email to activate your account"})
}

// CreateUserTokenPayload defines the JSON we expect for a login request.
type CreateUserTokenPayload struct {
	Email    string `json:"email" validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=3,max=72"`
}

// createTokenHandler handles user login and token generation.
func (app *application) createTokenHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreateUserTokenPayload
	// 1. Read and validate the request payload.
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}
	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	// 2. Fetch the user from the database by email.
	user, err := app.store.Users.GetByEmail(r.Context(), payload.Email)
	if err != nil {
		switch err {
		case store.ErrNotFound:
			// We send a generic "unauthorized" error to avoid revealing
			// which emails are registered in our system.
			app.unauthorizedErrorResponse(w, r, err)
		default:
			app.internalServerError(w, r, err)
		}
		return
	}

	// 3. Compare the provided password with the stored hash.
	if err := user.Password.Compare(payload.Password); err != nil {
		app.unauthorizedErrorResponse(w, r, err)
		return
	}

	// 4. If credentials are correct, create the JWT claims.
	claims := jwt.MapClaims{
		"sub": user.ID,                                 // Subject (the user's ID)
		"exp": time.Now().Add(time.Hour * 24 * 3).Unix(), // Expiration (3 days)
		"iat": time.Now().Unix(),                         // Issued At
		"iss": "gophersocial",                            // Issuer
	}

	// 5. Generate the token.
	token, err := app.authenticator.GenerateToken(claims)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// 6. Send the token to the client.
	if err := app.jsonResponse(w, http.StatusCreated, token); err != nil {
		app.internalServerError(w, r, err)
	}
}