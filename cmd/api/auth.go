package main

import (
	"net/http"

	"github.com/Har2yQn78/social_back.git/internal/store"
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