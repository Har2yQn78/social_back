package auth

import (
	"fmt"
	
	"github.com/golang-jwt/jwt/v5"
)

// JWTAuthenticator holds the configuration for our JWT implementation.
type JWTAuthenticator struct {
	secret string
	aud string
	id string
}

func NewJWTAuthenticator(secret, aud, id string) *JWTAuthenticator {
	return &JWTAuthenticator{secret, aud, id}
}

// GenerateToken creates and signs a new JWT with the given claims.
func (a *JWTAuthenticator) GenerateToken(claims jwt.Claims) (string, error) {
	// We'll use the HS256 signing algorithm.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// Sign the token with our secret key.
	tokenString, err := token.SignedString([]byte(a.secret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken parses and validates a token string.
func (a *JWTAuthenticator) ValidateToken(token string) (*jwt.Token, error) {
	// The library handles all the heavy lifting: checking the signature,
	// the expiration time, and other claims.
	return jwt.Parse(token, func(t *jwt.Token) (any, error) {
		// This callback function ensures the token's signing algorithm is what we expect.
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method %v", t.Header["alg"])
		}

		return []byte(a.secret), nil
	})
}
