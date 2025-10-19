package main

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"errors"

	"github.com/Har2yQn78/social_back.git/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
)

type userKey string
const userCtxKey userKey = "user"
type postKey string
const postCtxKey postKey = "post"

func (app *application) getUser(ctx context.Context, userID int64) (*store.User, error) {
	// If caching is disabled, just go straight to the database.
	if app.config.redisCfg.enabled == false {
		return app.store.Users.GetByID(ctx, userID)
	}

	// 1. Try to get the user from the cache.
	user, err := app.cacheStorage.Get(ctx, userID)
	if err != nil {
		return nil, err // A real error occurred with Redis.
	}

	// 2. If we have a cache hit, return the user.
	if user != nil {
		app.logger.Info("cache hit for user: ", userID)
		return user, nil
	}

	app.logger.Info("cache miss for user: ", userID)
	// 3. On a cache miss, get the user from the database.
	user, err = app.store.Users.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// 4. Store the fresh user data in the cache for next time.
	if err := app.cacheStorage.Set(ctx, user); err != nil {
		// We log the caching error but don't fail the request.
		// The user should still get their data even if caching fails.
		app.logger.Errorw("failed to cache user", "error", err)
	}

	return user, nil
}


func (app *application) AuthTokenMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 1. Get the Authorization header.
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			app.unauthorizedErrorResponse(w, r, fmt.Errorf("authorization header is missing"))
			return
		}

		// 2. The header should be in the format "Bearer <token>". We split it to get the token.
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			app.unauthorizedErrorResponse(w, r, fmt.Errorf("authorization header is malformed"))
			return
		}

		token := parts[1]
		// 3. Validate the token using our authenticator.
		jwtToken, err := app.authenticator.ValidateToken(token)
		if err != nil {
			app.unauthorizedErrorResponse(w, r, err)
			return
		}

		// 4. Extract the claims from the validated token.
		claims, ok := jwtToken.Claims.(jwt.MapClaims)
		if !ok {
			app.unauthorizedErrorResponse(w, r, fmt.Errorf("invalid token claims"))
			return
		}


		// 5. Get the user ID (the 'sub' claim) from the claims.
		userIDStr := fmt.Sprintf("%.f", claims["sub"]) 
		userID, err := strconv.ParseInt(userIDStr, 10, 64)
		if err != nil {
			app.unauthorizedErrorResponse(w, r, err)
			return
		}

		// 6. Fetch the user from the database USING OUR NEW HELPER.
        user, err := app.getUser(r.Context(), userID) // <-- THIS IS THE CHANGE
        if err != nil {
            app.unauthorizedErrorResponse(w, r, err)
            return
        }

		// 7. Add the user to the request context.
		ctx := context.WithValue(r.Context(), userCtxKey, user)

		// 8. Call the next handler in the chain, passing the modified context.
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (app *application) postsContextMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        idParam := chi.URLParam(r, "postID")
        id, err := strconv.ParseInt(idParam, 10, 64)
        if err != nil {
            app.badRequestResponse(w, r, errors.New("invalid post ID"))
            return
        }

        post, err := app.store.Posts.GetByID(r.Context(), id)
        if err != nil {
            if errors.Is(err, store.ErrNotFound) {
                app.notFoundResponse(w, r, err)
                return
            }
            app.internalServerError(w, r, err)
            return
        }

        // Put the post in the context.
        ctx := context.WithValue(r.Context(), postCtxKey, post)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}


func (app *application) RateLimiterMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if app.config.rateLimiter.Enabled {
			ip := r.RemoteAddr

			if allow, retryAfter := app.rateLimiter.Allow(ip); !allow {
				app.rateLimitExceededResponse(w, r, retryAfter.String())
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}
