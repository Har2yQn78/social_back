package ratelimiter

import (
	"sync"
	"time"
)

type FixedWindowRateLimiter struct {
	sync.RWMutex
	clients map[string]int
	limit   int
	window  time.Duration
}

func NewFixedWindowLimiter(limit int, window time.Duration) *FixedWindowRateLimiter {
	return &FixedWindowRateLimiter{
		clients: make(map[string]int),
		limit:   limit,
		window:  window,
	}
}

func (rl *FixedWindowRateLimiter) Allow(ip string) (bool, time.Duration) {
	rl.RLock() // Acquire a read lock to safely check the map.
	count, exists := rl.clients[ip]
	rl.RUnlock() // Release the read lock.

	if !exists || count < rl.limit {
		rl.Lock() // Acquire a full write lock to modify the map.
		if !exists {
			go rl.resetCount(ip)
		}
		rl.clients[ip]++
		rl.Unlock() // Release the write lock.
		return true, 0
	}

	// If the limit is reached, deny the request.
	return false, rl.window
}

// resetCount waits for the window duration and then removes the IP from the map.
func (rl *FixedWindowRateLimiter) resetCount(ip string) {
	time.Sleep(rl.window)
	rl.Lock() // Acquire a write lock to safely delete from the map.
	delete(rl.clients, ip)
	rl.Unlock()
}