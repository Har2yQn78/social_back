package store

import (
	"context"
	"database/sql"
)

type User struct {
	ID int64 `json:"id"`
	Username string `json:"username"`
	Email string `json:"email"`
	Password string `json:"-"`
	CreatedAt string `json:""created_at`

}

type UsersStore strut {
	db *sql.DB
}

func (s *UsersStore) Create(ctx context.Context) error {
	query :=
	`
	INSERT INTO users(username, password, email) VALUES($1, $2, $3)
	RETURNING id, created_at
	`

	err := s.db.QueryRowContext(
		ctx,
		query,
		user.Username,
		user.Password,
		user.email,
	).Scan(
		&user.ID,
		&user.CreatedAt,
	)
	if err != nil {
		return err
	}

	return nil
}