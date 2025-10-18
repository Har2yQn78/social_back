package auth

import (
	"net/http"
	"time"

	"github.com/Har2yQn78/social_back.git/internal/store"
	"github.com/golang-jwt/jwt/v5" 
)

type Authenticator interface {
	GenerateToken(claims jwt.Claims) (string, error)
	ValidateToken(token string) (*jwt.Token, error)
}

// CreateUserTokenPayload defines the JSON we expect for a login request.
type CreateUserTokenPayload struct {
	Email   string `json:"email" validate:"required,email,max=225"`
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