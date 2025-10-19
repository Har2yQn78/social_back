package store

import (
	"net/http"
	"strconv"
	"strings"
)

type PaginatedFeedQuery struct {
	Limit  int      `validate:"gte=1,lte=100"` // Limit must be between 1 and 100
	Offset int      `validate:"gte=0"`         // Offset must be 0 or greater
	Sort   string   `validate:"oneof=asc desc"`// Sort can only be 'asc' or 'desc'
	Tags   []string `validate:"max=5"`         // Allow a max of 5 tags
	Search string   `validate:"max=100"`       // Search term max 100 chars
}

func (fq *PaginatedFeedQuery) Parse(r *http.Request) {
	// Set defaults
	fq.Limit = 20
	fq.Offset = 0
	fq.Sort = "desc"
	fq.Tags = []string{}
	fq.Search = ""

	qs := r.URL.Query()

	if limitStr := qs.Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			fq.Limit = l
		}
	}

	if offsetStr := qs.Get("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil {
			fq.Offset = o
		}
	}

	if sortStr := qs.Get("sort"); sortStr != "" {
		fq.Sort = strings.ToLower(sortStr)
	}

	if tagsStr := qs.Get("tags"); tagsStr != "" {
		fq.Tags = strings.Split(tagsStr, ",")
	}

	if searchStr := qs.Get("search"); searchStr != "" {
		fq.Search = searchStr
	}
}