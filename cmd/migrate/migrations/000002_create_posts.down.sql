CREATE TABLE IF NOT EXISTS posts (
    id bigserial PRIMARY KEY,
    title varchar(255) NOT NULL,
    content text NOT NULL,
    userid bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tags text[] DEFAULT '{}',
    created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
    );
