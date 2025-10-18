package main

import (
	"net/http"
	"time"

	"github.com/Har2yQn78/social_back.git/internal/env"
	"github.com/Har2yQn78/social_back.git/internal/store"
	"github.com/Har2yQn78/social_back.git/internal/auth"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
)

type application struct {
	config config
	store  store.Storage
	logger *zap.SugaredLogger
	authenticator auth.Authenticator 
}

type config struct {
	addr string
	db   dbConfig
	auth authConfig
}

type authConfig struct {
	token tokenConfig
}

type tokenConfig struct {
	secret string
	iss    string
}


type dbConfig struct {
	addr         string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

func (app *application) mount() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/v1", func(r chi.Router) {
			r.Get("/health", app.healthCheckHandler)
			// Group authentication-related routes together.
			r.Route("/authentication", func(r chi.Router) {
				r.Post("/user", app.registerUserHandler) //register router
				r.Post("/token", app.createTokenHandler) //jwt token router
			})
			
			r.Group(func(r chi.Router) {
				// Apply our new authentication middleware to this group.
				r.Use(app.AuthTokenMiddleware)
				r.Post("/posts", app.createPostHandler)
				r.Get("/posts/{postID}", app.getPostHandler)
			})
		})

	return r
}

func (app *application) run(mux *chi.Mux) error {

	srv := &http.Server{
		Addr:         app.config.addr,
		Handler:      mux,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	app.logger.Infow("server has started",
		"addr", app.config.addr,
		"env", env.GetString("ENV", "development"),
	)

	return srv.ListenAndServe()
}
