 migrate -path ./cmd/migrate/migrations -database "postgres://admin:adminpassword@localhost/socialnetwork?sslmode=disable" up

  migrate -path ./cmd/migrate/migrations -database "postgres://admin:adminpassword@localhost/socialnetwork?sslmode=disable" down