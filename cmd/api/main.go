package main

import (
	"github.com/Har2yQn78/social_back.git/internal/db"
	"github.com/Har2yQn78/social_back.git/internal/env"
	"github.com/Har2yQn78/social_back.git/internal/store"
	"github.com/Har2yQn78/social_back.git/internal/auth"
	"go.uber.org/zap"
)

func main() {
	cfg := config{
		addr: env.GetString("ADDR", ":8080"),
		db: dbConfig{
			addr:         env.GetString("DB_ADDR", "postgres://admin:adminpassword@localhost/socialnetwork?sslmode=disable"),
			maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
			maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
			maxIdleTime:  env.GetString("DB_MAX_IDLE_TIME", "15m"),
		},
		auth: authConfig{
					token: tokenConfig{
						secret: env.GetString("AUTH_TOKEN_SECRET", "supersecretkeydontuseinprod"),
						iss:    "gophersocial",
					},
				},
	}

	// Initialize the logger
	logger, _ := zap.NewProduction()
	defer logger.Sync()
	sugar := logger.Sugar()

	db, err := db.New(
		cfg.db.addr,
		cfg.db.maxOpenConns,
		cfg.db.maxIdleConns,
		cfg.db.maxIdleTime,
	)
	if err != nil {
		sugar.Fatal(err)
	}

	defer db.Close()
	sugar.Info("database connection established")
	
	jwtAuthenticator := auth.NewJWTAuthenticator(
			cfg.auth.token.secret,
			cfg.auth.token.iss,
			cfg.auth.token.iss,
		)
	
	store := store.NewStorage(db)

	app := &application{
		config: cfg,
		store:  store,
		logger: sugar,
		authenticator: jwtAuthenticator,
	}

	mux := app.mount()

	if err := app.run(mux); err != nil {
		sugar.Fatal(err)
	}
}
