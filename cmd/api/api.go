package main

import (
	"net/http"
	"time"

	"github.com/Har2yQn78/social_back.git/internal/auth"
	"github.com/Har2yQn78/social_back.git/internal/store"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
	"github.com/Har2yQn78/social_back.git/internal/store/cache"
)

type application struct {
	config        config
	store         store.Storage
	logger        *zap.SugaredLogger
	authenticator auth.Authenticator
	cacheStorage  *cache.UserStore
}

type config struct {
	addr        string
	db          dbConfig
	auth        authConfig
	redisCfg redisConfig
}

type redisConfig struct {
    addr string
    pw string
    db int
    enabled bool
}

type dbConfig struct {
	addr         string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

type authConfig struct {
	token tokenConfig
}

type tokenConfig struct {
	secret string
	iss    string
}

func (app *application) mount() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Route("/v1", func(r chi.Router) {
		r.Get("/health", app.healthCheckHandler)

		r.Route("/authentication", func(r chi.Router) {
			r.Post("/user", app.registerUserHandler)
			r.Post("/token", app.createTokenHandler)
		})

		r.Group(func(r chi.Router) {
			r.Use(app.AuthTokenMiddleware)
			r.Post("/posts", app.createPostHandler)
			r.Route("/posts/{postID}", func(r chi.Router) {
				r.Use(app.postsContextMiddleware)

				r.Get("/", app.getPostHandler)
				r.Patch("/", app.updatePostHandler)
				r.Delete("/", app.deletePostHandler)
			})
			r.Route("/users/{userID}", func(r chi.Router) {
	            r.Put("/follow", app.followUserHandler)
	            r.Put("/unfollow", app.unfollowUserHandler)
        	})
			r.Get("/users/feed", app.getUserFeedHandler)
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
	)

	return srv.ListenAndServe()
}