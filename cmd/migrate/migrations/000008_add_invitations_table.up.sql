CREATE TABLE IF NOT EXISTS user_invitations(
token_hash bytea PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expiry timestamp(0) with time zone NOT NULL
);