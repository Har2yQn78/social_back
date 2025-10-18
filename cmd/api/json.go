package main

import (
	"encoding/json"
	"net/http"
)

// readJSON is a helper for decoding JSON from a request body.
func writeJSON(w http.ResponseWriter, r *http.Request, data any) error {
	max_Bytes := 1_048_578 //1MB
	r.Body = http.MaxBytesReader(w, r.Body, int64(max_Bytes))

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	return decoder.Decode(data)
}

// writeJSONError is a helper for sending a consistent JSON error message.
func writeJSONError(w http.ResponseWriter, status int, message string) error {
	type envelope struct {
		Error string `json:"error"`
	}

	return writeJSON(w, status, &envelope{Error: message})
}

// jsonResponse is a wrapper to send data in a consistent format, e.g., {"data": ...}.
func (app *application) jsonResponse(w http.ResponseWriter, status int, data any) error {
	type envelope struct {
		Data any `json:"data"`
	}

	return writeJSON(w, status, &envelope{Data: data})
}
