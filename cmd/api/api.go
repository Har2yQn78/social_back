package main

import (
	"log"
	"net/http"
	"time"
	"github.com/gorilla/mux"
)

type application struct {
	config config

}

type config struct {
	addr string
}

func (app *application) run() error {
	mux := http.NewServeMux()

	srv := &http.Server{
	Addr:    app.config.addr,
	Handler: mux,
	WriteTimeout: time.Second * 30,
	}

	log.Printf("Server is runing on Port: %s", app.config.addr)
	
	return srv.ListenAndServe()
}