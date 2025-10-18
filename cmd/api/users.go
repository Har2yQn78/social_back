package main

import (
	"net/http"

	"github.com/Har2yQn78/social_back.git/internal/store"
)

// getUserFromContext is a helper that retrieves the authenticated user from the request context.
// It will panic if the user is not in the context, because this function should only
// ever be called by handlers that are protected by our auth middleware.
func getUserFromContext(r *http.Request) *store.User {
	user, ok := r.Context().Value(userCtxKey).(*store.User)
	if !ok {
		panic("user not found in context")
	}
	return user
}