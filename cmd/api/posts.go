package main

import (
	"net/http"
	
	"github.com/Har2yQn78/social_back.git/internal/store"
)

type CreatePostPayload struct {
	Title   string   `json:"title" validate:"required,max=100"`
	Content string   `json:"content" validate:"required,max=1000"`
	Tags    []string `json:"tags"`
}


func getPostFromCtx(r *http.Request) *store.Post {
    post, ok := r.Context().Value(postCtxKey).(*store.Post)
    if !ok {
        panic("post not found in context")
    }
    return post
}


func (app *application) createPostHandler(w http.ResponseWriter, r *http.Request) {
	var payload CreatePostPayload
	if err := readJSON(w, r, &payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	if err := Validate.Struct(payload); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	user := getUserFromContext(r)

	post := &store.Post{
		Title:   payload.Title,
		Content: payload.Content,
		Tags:    payload.Tags,
		UserID:  user.ID, 
	}

	if err := app.store.Posts.Create(r.Context(), post); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusCreated, post); err != nil {
		app.internalServerError(w, r, err)
	}
}

func (app *application) getPostHandler(w http.ResponseWriter, r *http.Request) {
    post := getPostFromCtx(r)
    if err := app.jsonResponse(w, http.StatusOK, post); err != nil {
        app.internalServerError(w, r, err)
    }
}

type UpdatePostPayload struct {
    Title   *string  `json:"title" validate:"omitempty,max=100"`
    Content *string  `json:"content" validate:"omitempty,max=1000"`
    Tags    []string `json:"tags"`
}

func (app *application) updatePostHandler(w http.ResponseWriter, r *http.Request) {
    post := getPostFromCtx(r)
    user := getUserFromContext(r)

    // *** AUTHORIZATION CHECK ***
    if post.UserID != user.ID {
        app.forbiddenResponse(w, r)
        return
    }

    var payload UpdatePostPayload
    if err := readJSON(w, r, &payload); err != nil { app.badRequestResponse(w, r, err); return }
    if err := Validate.Struct(payload); err != nil { app.badRequestResponse(w, r, err); return }

    if payload.Title != nil { post.Title = *payload.Title }
    if payload.Content != nil { post.Content = *payload.Content }
    if payload.Tags != nil { post.Tags = payload.Tags }

    if err := app.store.Posts.Update(r.Context(), post); err != nil {
        app.internalServerError(w, r, err)
        return
    }
    if err := app.jsonResponse(w, http.StatusOK, post); err != nil {
        app.internalServerError(w, r, err)
    }
}

func (app *application) deletePostHandler(w http.ResponseWriter, r *http.Request) {
    post := getPostFromCtx(r)
    user := getUserFromContext(r)

    // *** AUTHORIZATION CHECK ***
    if post.UserID != user.ID {
        app.forbiddenResponse(w, r)
        return
    }

    if err := app.store.Posts.Delete(r.Context(), post.ID); err != nil {
        app.internalServerError(w, r, err)
        return
    }
    w.WriteHeader(http.StatusNoContent)
}