package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/Har2yQn78/social_back.git/internal/store"
)

type UserStore struct {
	rdb *redis.Client
}

const UserExpTime = time.Minute * 5 // Cache user data for 5 minutes

func NewUserStore(rdb *redis.Client) *UserStore {
    return &UserStore{rdb: rdb}
}

func (s *UserStore) Get(ctx context.Context, userID int64) (*store.User, error) {
	cacheKey := fmt.Sprintf("user-%d", userID)

	// Try to get the data from Redis.
	data, err := s.rdb.Get(ctx, cacheKey).Result()
	if err == redis.Nil {
		return nil, nil // Cache miss: This is not an error.
	} else if err != nil {
		return nil, err // A real error occurred.
	}

	var user store.User
	if err := json.Unmarshal([]byte(data), &user); err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *UserStore) Set(ctx context.Context, user *store.User) error {
	cacheKey := fmt.Sprintf("user-%d", user.ID)

	// Marshal the user struct into a JSON string.
	json, err := json.Marshal(user)
	if err != nil {
		return err
	}

	// Set the key in Redis with our specified expiration time.
	return s.rdb.SetEX(ctx, cacheKey, json, UserExpTime).Err()
}