package store

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type Storage struct {
	Posts interface {
		Create(context.Context, *Post) error
		GetByID(context.Context, int64)	(*Post, error)
		Update(context.Context, *Post) error
		Delete(context.Context, int64) error
		GetUserFeed(context.Context, int64) ([]Post, error)
	}
	Users interface {
		CreateAndInvite(ctx context.Context, user *User, token string, exp time.Duration) error
		GetByEmail(context.Context, string) (*User, error)
		GetByID(context.Context, int64) (*User, error) 
		Activate(context.Context, string) error
	}
	Followers interface {
        Follow(ctx context.Context, followedID, followerID int64) error
        Unfollow(ctx context.Context, followedID, followerID int64) error
    }
    Comments interface {
            Create(context.Context, *Comment) error
            GetByPostID(context.Context, int64) ([]Comment, error)
        }
}

var (
    ErrNotFound = errors.New("resource not found")
    ErrConflict = errors.New("resource already exists")
)

func NewStorage(db *sql.DB) Storage {
	return Storage {
		Posts:     &PostsStore{db},
		Users: 	   &UsersStore{db},
		Followers: &FollowersStore{db},
		Comments:  &CommentStore{db},
	}
}

func withTx(db *sql.DB, ctx context.Context, fn func(*sql.Tx) error) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil { return err }
	if err := fn(tx); err != nil {
		_ = tx.Rollback()
		return err
	}
	return tx.Commit()
}