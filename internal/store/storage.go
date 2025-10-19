package store

import (
	"context"
	"database/sql"
	"errors"
)

type Storage struct {
	Posts interface {
		Create(context.Context, *Post) error
		GetByID(context.Context, int64)	(*Post, error)
		Update(context.Context, *Post) error
		Delete(context.Context, int64) error
	}
	Users interface {
		Create(context.Context, *User) error
		GetByEmail(context.Context, string) (*User, error)
		GetByID(context.Context, int64) (*User, error) 
	}
	Followers interface {
        Follow(ctx context.Context, followedID, followerID int64) error
        Unfollow(ctx context.Context, followedID, followerID int64) error
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
	}
}