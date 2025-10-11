package main

import (
	"log"

	"github.com/Har2yQn78/social_back.git/internal/env"
)

func main() {
	cfg := config{
		addr: env.GetString("ADDR", ":8080"),
	}

	app := &application{
		config: cfg,
	}
	

	mux := app.mount()

	log.Fatal(app.run(mux))
}
