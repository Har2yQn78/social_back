package store

import (
	"context"
	"database/sql"
	"errors"

	"github.com/lib/pq"
)

type Post struct {
	ID        int64    `json:"id"`
	Content   string   `json:"content"`
	Title     string   `json:"title"`
	UserID    int64    `json:"userid"`
	Tags      []string `json:"tags"`
	CreatedAt string   `json:"created_at"`
	UpdatedAt string   `json:"updated_at"`
	Version   int      `json:"version"`
}

type PostsStore struct {
	db *sql.DB
}

func (s *PostsStore) Create(ctx context.Context, post *Post) error {
    query := `
        INSERT INTO posts (content, title, user_id, tags)
        VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at
    `
    err := s.db.QueryRowContext(
        ctx,
        query,
        post.Content,
        post.Title,
        post.UserID,
        pq.Array(post.Tags),
    ).Scan(
        &post.ID,
        &post.CreatedAt,
        &post.UpdatedAt,
    )
    if err != nil {
        return err
    }

    return nil
}


func (s *PostsStore) GetByID(ctx context.Context, id int64) (*Post, error) {
	query := `
		SELECT id, user_id, title, content, created_at, updated_at, tags, version
		FROM posts
		WHERE id = $1
	`

	var post Post
	var tags pq.StringArray
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&post.ID,
		&post.UserID,
		&post.Title,
		&post.Content,
		&post.CreatedAt,
		&post.UpdatedAt, 
		&tags,
		&post.Version,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	post.Tags = tags
	
	return &post, nil
}

//update posts
func (s *PostsStore) Update(ctx context.Context, post *Post) error {
    query := `
        UPDATE posts
        SET title = $1, content = $2, tags = $3, updated_at = NOW(), version = version + 1
        WHERE id = $4 AND version = $5
        RETURNING version
    `
    err := s.db.QueryRowContext(ctx, query,
        post.Title, post.Content, pq.Array(post.Tags), post.ID, post.Version,
    ).Scan(&post.Version) 

    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return ErrNotFound 
        }
        return err
    }
    return nil
}


// Delete func
func (s *PostsStore) Delete(ctx context.Context, postID int64) error {
    query := `DELETE FROM posts WHERE id = $1`

    res, err := s.db.ExecContext(ctx, query, postID)
    if err != nil {
        return err
    }

    rows, err := res.RowsAffected()
    if err != nil {
        return err
    }
    if rows == 0 {
        return ErrNotFound
    }
    return nil
}

func (s *PostsStore) GetUserFeed(ctx context.Context, userID int64) ([]Post, error) {
	query := `
	SELECT p.id, p.user_id, p.title, p.content, p.created_at, p.updated_at, p.tags, p.version
	FROM posts p
	LEFT JOIN followers f ON f.user_id = p.user_id
	WHERE f.follower_id = $1 OR p.user_id = $1
	GROUP BY p.id
	ORDER BY p.created_at DESC
	LIMIT 20
			`
	rows, err := s.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var feed []Post
    for rows.Next() {
        var p Post
        var tags pq.StringArray
        err := rows.Scan(
            &p.ID, &p.UserID, &p.Title, &p.Content,
            &p.CreatedAt, &p.UpdatedAt, &tags, &p.Version,
        )
        if err != nil {
            return nil, err
        }
        p.Tags = tags
        feed = append(feed, p)
    }
    
    if err = rows.Err(); err != nil {
           return nil, err
       }
   
       return feed, nil
}
