package main

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type userKey string
const userCtxKey userKey = "user"


func (app *application) AuthTokenMiddleware(next http.Handler) http.Handler {
	// http.HandlerFunc is an adapter that lets us use regular functions as HTTP handlers.
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

		// 6. Fetch the user from the database. This ensures the user still exists and is active.
		user, err := app.store.Users.GetByID(r.Context(), userID)
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