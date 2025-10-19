package main

import (
	"github.com/Har2yQn78/social_back.git/internal/db"
	"github.com/Har2yQn78/social_back.git/internal/env"
	"github.com/Har2yQn78/social_back.git/internal/store"
	"github.com/Har2yQn78/social_back.git/internal/auth"
	"go.uber.org/zap"
	"github.com/Har2yQn78/social_back.git/internal/store/cache"
	"github.com/go-redis/redis/v8"
	"github.com/Har2yQn78/social_back.git/internal/ratelimiter"
	"time"
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
				redisCfg: redisConfig{
            addr:    env.GetString("REDIS_ADDR", "localhost:6379"),
            pw:      env.GetString("REDIS_PW", ""),
            db:      env.GetInt("REDIS_DB", 0),
            enabled: env.GetBool("REDIS_ENABLED", true),
        },
        rateLimiter: ratelimiter.Config{
                    RequestsPerTimeFrame: env.GetInt("RATELIMITER_REQUESTS_COUNT", 20),
                    TimeFrame:            time.Second * 5,
                    Enabled:              env.GetBool("RATE_LIMITER_ENABLED", true),
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
	
	rateLimiter := ratelimiter.NewFixedWindowLimiter(
        cfg.rateLimiter.RequestsPerTimeFrame,
        cfg.rateLimiter.TimeFrame,
    )
	
	var rdb *redis.Client
    if cfg.redisCfg.enabled {
        rdb = cache.NewRedisClient(cfg.redisCfg.addr, cfg.redisCfg.pw, cfg.redisCfg.db)
        sugar.Info("redis cache connection established")
        defer rdb.Close()
    }
    cacheStorage := cache.NewUserStore(rdb)

	app := &application{
		config: 		cfg,
		store:  		store,
		logger: 		sugar,
		authenticator:  jwtAuthenticator,
		cacheStorage:   cacheStorage,
		rateLimiter: 	rateLimiter,
	}

	mux := app.mount()

	if err := app.run(mux); err != nil {
		sugar.Fatal(err)
	}
}
