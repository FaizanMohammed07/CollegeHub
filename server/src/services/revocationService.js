/**
 * Simple in-memory revocation list for JWT tokens
 * In production, this should be stored in Redis for distributed systems
 */
class RevocationService {
  constructor() {
    this.revokedTokens = new Map();
    this.ttlMs =
      parseInt(process.env.REVOCATION_CACHE_TTL_MINUTES || 60) * 60 * 1000;
  }

  /**
   * Add token to revocation list
   */
  revokeToken(token, expiresAt) {
    this.revokedTokens.set(token, {
      revokedAt: new Date(),
      expiresAt: expiresAt || new Date(Date.now() + this.ttlMs),
    });

    // Schedule cleanup
    this.scheduleCleanup();
  }

  /**
   * Check if token is revoked
   */
  isRevoked(token) {
    const entry = this.revokedTokens.get(token);
    if (!entry) return false;

    // Check if revoked token has expired
    if (new Date() > entry.expiresAt) {
      this.revokedTokens.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Clean up expired revoked tokens
   */
  scheduleCleanup() {
    setTimeout(() => {
      const now = new Date();
      for (const [token, entry] of this.revokedTokens.entries()) {
        if (now > entry.expiresAt) {
          this.revokedTokens.delete(token);
        }
      }
    }, this.ttlMs);
  }

  /**
   * Clear all revoked tokens (useful for testing)
   */
  clear() {
    this.revokedTokens.clear();
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalRevoked: this.revokedTokens.size,
      ttlMs: this.ttlMs,
    };
  }
}

export default new RevocationService();
