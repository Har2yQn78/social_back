package main

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/Har2yQn78/social_back.git/internal/store"
	"github.com/go-chi/chi/v5"
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

func (app *application) followUserHandler(w http.ResponseWriter, r *http.Request) {
	followerUser := getUserFromContext(r)
	followedID, err := strconv.ParseInt(chi.URLParam(r, "userID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, errors.New("invalid user ID"))
		return
	}

	err = app.store.Followers.Follow(r.Context(), followedID, followerUser.ID)
	if err != nil {
		if errors.Is(err, store.ErrConflict) {
			app.conflictResponse(w, r, err)
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	app.jsonResponse(w, http.StatusOK, map[string]string{"message": "user followed"})
}

func (app *application) unfollowUserHandler(w http.ResponseWriter, r *http.Request) {
	followerUser := getUserFromContext(r)

	followedID, err := strconv.ParseInt(chi.URLParam(r, "userID"), 10, 64)
	if err != nil {
		app.badRequestResponse(w, r, errors.New("invalid user ID"))
		return
	}

	err = app.store.Followers.Unfollow(r.Context(), followedID, followerUser.ID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	app.jsonResponse(w, http.StatusOK, map[string]string{"message": "user unfollowed"})
}