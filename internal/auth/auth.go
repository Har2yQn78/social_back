package auth

import "github.com/golang-jwt/jwt/v5"

// Authenticator defines the contract for generating and validating tokens.
type Authenticator interface {
	GenerateToken(claims jwt.Claims) (string, error)
	ValidateToken(token string) (*jwt.Token, error)
}