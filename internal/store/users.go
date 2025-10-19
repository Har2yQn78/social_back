package store

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)


var (
	ErrDuplicateEmail    = errors.New("a user with that email already exists")
	ErrDuplicateUsername = errors.New("a user with that username already exists")
)

type password struct {
	text *string
	hash []byte
}

// The Set method takes a plain-text password, hashes it with bcrypt,
// and stores both the original and the hash in the struct.
func (p *password) Set(text string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(text), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	p.text = &text
	p.hash = hash
	
	return nil
}

// The Compare method (which we will use in the login step) checks if a given
// plain-text password matches the stored hash.
func (p *password) Compare(text string) error {
	return bcrypt.CompareHashAndPassword(p.hash, []byte(text))
}

type User struct {
	ID        int64  `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  password `json:"-"`
	CreatedAt string `json:"created_at"`
	IsActive  bool     `json:"is_active"`
}

type UsersStore struct {
	db *sql.DB
}

func (s *UsersStore) Create(ctx context.Context, user *User) error {
	query :=
		`
	INSERT INTO users(username, password, email) VALUES($1, $2, $3)
	RETURNING id, created_at
	`

	err := s.db.QueryRowContext(
		ctx,
		query,
		user.Username,
		user.Password.hash, //use the hash
		user.Email,
	).Scan(
		&user.ID,
		&user.CreatedAt,
	)
	if err != nil {
			// This is how we check for specific PostgreSQL error codes.
			// "23505" is the code for a "unique_violation".
			switch {
			case err.Error() == `pq: duplicate key value violates unique constraint "users_email_key"`:
				return ErrDuplicateEmail
			case err.Error() == `pq: duplicate key value violates unique constraint "users_username_key"`:
				return ErrDuplicateUsername
			default:
				return err
			}
		}

	return nil
}


func (s *UsersStore) GetByEmail(ctx context.Context, email string) (*User, error) {
	query := `SELECT id, username, email, password, created_at FROM users WHERE email = $1 AND is_active = TRUE`
	var user User
	err := s.db.QueryRowContext(ctx, query, email).Scan(&user.ID, &user.Username, &user.Email, &user.Password.hash, &user.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) { return nil, ErrNotFound }
		return nil, err
	}
	return &user, nil
}
    
func (s *UsersStore) GetByID(ctx context.Context, userID int64) (*User, error) {
    query := `SELECT id, username, email, password, created_at FROM users WHERE id = $1 AND is_active = TRUE`
    var user User
    err := s.db.QueryRowContext(ctx, query, userID).Scan(&user.ID, &user.Username, &user.Email, &user.Password.hash, &user.CreatedAt)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) { return nil, ErrNotFound }
        return nil, err
    }
    return &user, nil
}

func (s *UsersStore) Activate(ctx context.Context, plainToken string) error {
	hash := sha256.Sum256([]byte(plainToken))
	tokenHash := hex.EncodeToString(hash[:])

	return withTx(s.db, ctx, func(tx *sql.Tx) error {
		var userID int64
		query := `SELECT user_id FROM user_invitations WHERE token_hash = $1 AND expiry > $2`
		err := tx.QueryRowContext(ctx, query, tokenHash, time.Now()).Scan(&userID)
		if err != nil { return ErrNotFound }

		query = `UPDATE users SET is_active = TRUE WHERE id = $1`
		_, err = tx.ExecContext(ctx, query, userID)
		if err != nil { return err }

		query = `DELETE FROM user_invitations WHERE user_id = $1`
		_, err = tx.ExecContext(ctx, query, userID)
		return err
	})
}

func (s *UsersStore) CreateAndInvite(ctx context.Context, user *User, plainToken string, exp time.Duration) error {
	hash := sha256.Sum256([]byte(plainToken))
	tokenHash := hex.EncodeToString(hash[:])

	return withTx(s.db, ctx, func(tx *sql.Tx) error {
		query := `INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id, created_at`
		err := tx.QueryRowContext(ctx, query, user.Username, user.Password.hash, user.Email).Scan(&user.ID, &user.CreatedAt)
		if err != nil {
			switch {
			case err.Error() == `pq: duplicate key value violates unique constraint "users_email_key"`:
				return ErrDuplicateEmail
			case err.Error() == `pq: duplicate key value violates unique constraint "users_username_key"`:
				return ErrDuplicateUsername
			default:
				return err
			}
		}
		query = `INSERT INTO user_invitations (token_hash, user_id, expiry) VALUES ($1, $2, $3)`
		_, err = tx.ExecContext(ctx, query, tokenHash, user.ID, time.Now().Add(exp))
		return err
	})
}