/**
 * Rate limiting utilities
 * Simple in-memory rate limiter (can be replaced with Redis in production)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
}

const defaultConfig: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  keyGenerator: (req) => {
    // Default: use IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
    return ip;
  },
};

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(req: Request, config: Partial<RateLimitConfig> = {}): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const finalConfig = { ...defaultConfig, ...config };
  const key = finalConfig.keyGenerator?.(req) || 'unknown';
  const now = Date.now();

  // Clean up expired entries (simple cleanup)
  if (Math.random() < 0.01) {
    // 1% chance to cleanup on each request
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });
  }

  // Get or create entry
  let entry = store[key];

  if (!entry || entry.resetTime < now) {
    // Create new window
    entry = {
      count: 0,
      resetTime: now + finalConfig.windowMs,
    };
    store[key] = entry;
  }

  // Increment count
  entry.count++;

  const remaining = Math.max(0, finalConfig.maxRequests - entry.count);
  const allowed = entry.count <= finalConfig.maxRequests;

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Rate limit middleware factory
 */
export function createRateLimit(config: Partial<RateLimitConfig> = {}) {
  return (req: Request): { allowed: boolean; remaining: number; resetTime: number } => {
    return checkRateLimit(req, config);
  };
}

/**
 * Stricter rate limit for auth endpoints
 */
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
});

/**
 * Stricter rate limit for submission endpoints
 */
export const submissionRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 submissions per hour
});

