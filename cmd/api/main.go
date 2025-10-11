package main

import (
	"log"

	"github.com/Har2yQn78/social_back.git/internal/env"
	"github.com/Har2yQn78/social_back.git/internal/store"
)

func main() {
	cfg := config{
		addr: env.GetString("ADDR", ":8080"),
		db: dbConfig{
			addr: env.GetString("DB_ADDR", "postgres://user:adminpassword@localhost/backend_golang?sslmode=disable"),
			maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
			maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
			maxIdletTime: env.GetString("DB_MAX_IDLE_TIME", "15min"),
		},
	}

	store := store.NewStorage(nil)

	app := &application{
		config: cfg,
		store : store,
	}



	mux := app.mount()

	log.Fatal(app.run(mux))
}
