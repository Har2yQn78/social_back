package store

import (
	"context"
	"database/sql"
	
	"github.com/lib/pq"
)


type FollowersStore struct {
	db *sql.DB
}

func (s *FollowersStore) Follow(ctx context.Context, followedID, followerID int64) error {
	query := `
	INSTER INTO followers (user_id,follower_id) VALUE ($1, $2)
	`
	_, err := s.db.ExecContext(ctx, query, followedID, followerID)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			return ErrConflict
		}
		return err
	}
	return nil
}

func (s *FollowersStore) Unfollow(ctx context.Context, followedID, followerID int64) error {
	query := `
		DELETE FROM followers
		WHERE user_id = $1 AND follower_id = $2
	`
	_, err := s.db.ExecContext(ctx, query, followedID, followerID)
	return err
}