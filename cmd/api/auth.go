package main

import (
	"net/http"
	"time"

	"github.com/Har2yQn78/social_back.git/internal/store"
	"github.com/golang-jwt/jwt/v5" 
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
	// 1. Decode the incoming JSON from the request body.
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	// 2. Validate the decoded payload using the rules in our struct tags.
	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	// 3. Create a new user model.
	user := &store.User{
		Username: payload.Username,
		Email:    payload.Email,
	}

	// 4. Hash the password securely.
	if err := user.Password.Set(payload.Password); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// 5. Save the new user to the database.
	ctx := r.Context()
	err := app.store.Users.Create(ctx, user)
	if err != nil {
		switch err {
		// Check for our custom errors and respond appropriately.
		case store.ErrDuplicateEmail:
			app.badRequestResponse(w, r, err)
		case store.ErrDuplicateUsername:
			app.badRequestResponse(w, r, err)
		default:
			// For any other error, send a generic 500.
			app.internalServerError(w, r, err)
		}
		return
	}

	// 6. Send a success response back to the client.
	if err := app.jsonResponse(w, http.StatusCreated, user); err != nil {
		app.internalServerError(w, r, err)
	}
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