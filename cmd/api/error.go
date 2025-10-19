package main

import "net/http"

func (app *application) internalServerError(w http.ResponseWriter, r *http.Request, err error) {
	// Use our new structured logger to log the detailed error.
	app.logger.Errorw("internal error", "method", r.Method, "path", r.URL.Path, "error", err.Error())

	// Use our new JSON helper to send a generic response to the client.
	writeJSONError(w, http.StatusInternalServerError, "the server encountered a problem")
}

func (app *application) badRequestResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Warnw("bad request", "method", r.Method, "path", r.URL.Path, "error", err.Error())

	writeJSONError(w, http.StatusBadRequest, err.Error())
}

func (app *application) unauthorizedErrorResponse(w http.ResponseWriter, r *http.Request, err error) {
    app.logger.Warnw("unauthorized error", "method", r.Method, "path", r.URL.Path, "error", err.Error())
    
    writeJSONError(w, http.StatusUnauthorized, "invalid credentials")
}

func (app *application) notFoundResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Warnw("not found error", "method", r.Method, "path", r.URL.Path, "error", err.Error())
	writeJSONError(w, http.StatusNotFound, "the requested resource was not found")
}

func (app *application) forbiddenResponse(w http.ResponseWriter, r *http.Request) {
    app.logger.Warnw("forbidden", "method", r.Method, "path", r.URL.Path)
    writeJSONError(w, http.StatusForbidden, "you do not have permission to access this resource")
}

func (app *application) conflictResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logger.Warnw("conflict response", "method", r.Method, "path", r.URL.Path, "error", err.Error())
	writeJSONError(w, http.StatusConflict, "you are already following this user")
}
