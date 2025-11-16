import axios from "axios";
import logger from "../utils/logger.js";
import { AppError, ERROR_CODES } from "../utils/AppError.js";

/**
 * Map Service - Pluggable wrapper for map providers
 * Supports geocoding, reverse geocoding, and route estimation
 * Implements caching and fallback logic
 */

class MapService {
  constructor() {
    this.provider = process.env.MAP_PROVIDER || "mapbox";
    this.apiKey = process.env.MAPBOX_API_KEY;
    this.cache = new Map();
    this.cacheTTL =
      parseInt(process.env.MAP_CACHE_TTL_MINUTES || 10) * 60 * 1000;
  }

  /**
   * Generate cache key for requests
   */
  generateCacheKey(from, to, mode = "driving") {
    return `${from.lat},${from.lng}|${to.lat},${to.lng}|${mode}`;
  }

  /**
   * Check cache for existing route
   */
  checkCache(from, to, mode) {
    const key = this.generateCacheKey(from, to, mode);
    const cached = this.cache.get(key);

    if (cached && new Date() - cached.timestamp < this.cacheTTL) {
      logger.debug({ key }, "Route estimate from cache");
      return cached.data;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Store result in cache
   */
  setCache(from, to, mode, data) {
    const key = this.generateCacheKey(from, to, mode);
    this.cache.set(key, {
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Geocode an address to coordinates
   * Returns { lat, lng, formattedAddress, provider }
   */
  async geocode(address) {
    try {
      if (
        !address ||
        typeof address !== "string" ||
        address.trim().length === 0
      ) {
        throw new AppError(
          ERROR_CODES.VALIDATION_ERROR,
          "Address is required and must be a non-empty string",
          400
        );
      }

      logger.info({ address, provider: this.provider }, "Geocoding address");

      if (this.provider === "mapbox" && this.apiKey) {
        return await this.geocodeMapbox(address);
      }

      // Fallback: return error (no fallback provider implemented yet)
      throw new AppError(
        ERROR_CODES.GEOCODING_FAILED,
        "No geocoding provider available",
        503
      );
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, address }, "Geocoding failed");
      throw new AppError(
        ERROR_CODES.GEOCODING_FAILED,
        "Unable to geocode address",
        500
      );
    }
  }

  /**
   * Mapbox geocoding implementation
   */
  async geocodeMapbox(address) {
    try {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`;

      const response = await axios.get(url, {
        params: {
          access_token: this.apiKey,
          limit: 1,
        },
        timeout: 5000,
      });

      if (!response.data.features || response.data.features.length === 0) {
        throw new AppError(
          ERROR_CODES.GEOCODING_FAILED,
          "Address not found",
          404
        );
      }

      const feature = response.data.features[0];
      return {
        lat: feature.center[1],
        lng: feature.center[0],
        formattedAddress: feature.place_name,
        provider: "mapbox",
        confidence: feature.relevance,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.code === "ECONNABORTED") {
        logger.warn({ address }, "Geocoding request timed out");
      }
      throw new AppError(
        ERROR_CODES.GEOCODING_FAILED,
        "Mapbox geocoding service unavailable",
        503
      );
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat, lng) {
    try {
      this.validateCoordinates(lat, lng);
      logger.info({ lat, lng }, "Reverse geocoding coordinates");

      if (this.provider === "mapbox" && this.apiKey) {
        return await this.reverseGeocodeMapbox(lat, lng);
      }

      throw new AppError(
        ERROR_CODES.GEOCODING_FAILED,
        "No reverse geocoding provider available",
        503
      );
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error({ error, lat, lng }, "Reverse geocoding failed");
      throw new AppError(
        ERROR_CODES.GEOCODING_FAILED,
        "Unable to reverse geocode coordinates",
        500
      );
    }
  }

  /**
   * Mapbox reverse geocoding implementation
   */
  async reverseGeocodeMapbox(lat, lng) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;

      const response = await axios.get(url, {
        params: {
          access_token: this.apiKey,
          limit: 1,
        },
        timeout: 5000,
      });

      if (!response.data.features || response.data.features.length === 0) {
        return {
          lat,
          lng,
          formattedAddress: `${lat}, ${lng}`,
          provider: "mapbox",
        };
      }

      const feature = response.data.features[0];
      return {
        lat,
        lng,
        formattedAddress: feature.place_name,
        provider: "mapbox",
      };
    } catch (error) {
      throw new AppError(
        ERROR_CODES.GEOCODING_FAILED,
        "Mapbox reverse geocoding failed",
        503
      );
    }
  }

  /**
   * Get route estimate between two points
   * Returns { etaSeconds, distanceMeters, polyline, steps, reliabilityScore, provider, providerMeta }
   */
  async getRouteEstimate(from, to, mode = "driving") {
    try {
      this.validateCoordinates(from.lat, from.lng);
      this.validateCoordinates(to.lat, to.lng);

      // Check cache first
      const cached = this.checkCache(from, to, mode);
      if (cached) {
        return cached;
      }

      logger.info(
        { from, to, mode, provider: this.provider },
        "Estimating route"
      );

      let result;
      if (this.provider === "mapbox" && this.apiKey) {
        result = await this.getRouteMapbox(from, to, mode);
      } else {
        // Fallback to haversine + average speed
        result = this.getFallbackRouteEstimate(from, to, mode);
      }

      // Cache the result
      this.setCache(from, to, mode, result);

      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;

      logger.warn(
        { error, from, to },
        "Primary route estimation failed, using fallback"
      );

      // Return fallback estimate
      try {
        return this.getFallbackRouteEstimate(from, to, mode);
      } catch (fallbackError) {
        throw new AppError(
          ERROR_CODES.ROUTE_ESTIMATION_FAILED,
          "Unable to estimate route",
          500
        );
      }
    }
  }

  /**
   * Mapbox directions implementation
   */
  async getRouteMapbox(from, to, mode) {
    try {
      const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${coordinates}`;

      const response = await axios.get(url, {
        params: {
          access_token: this.apiKey,
          steps: true,
          geometries: "polyline",
        },
        timeout: 5000,
      });

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error("No route found");
      }

      const route = response.data.routes[0];
      const etaSeconds = Math.ceil(route.duration);
      const distanceMeters = Math.ceil(route.distance);

      return {
        etaSeconds,
        distanceMeters,
        polyline: route.geometry,
        steps: route.legs[0]?.steps || [],
        provider: "mapbox",
        reliabilityScore: this.computeReliabilityScore(etaSeconds),
        providerMeta: {
          providerName: "mapbox",
          travelTimeVariance: 0.15, // Mapbox typical variance
          timestamp: new Date().toISOString(),
          rawResponse: {
            duration: route.duration,
            distance: route.distance,
          },
        },
      };
    } catch (error) {
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        throw new Error("Mapbox service timeout");
      }
      throw error;
    }
  }

  /**
   * Fallback route estimation using haversine + average speed
   * Returns reasonable estimate without external API dependency
   */
  getFallbackRouteEstimate(from, to, mode) {
    const distanceMeters = this.haversineDistance(
      from.lat,
      from.lng,
      to.lat,
      to.lng
    );

    // Average speeds (km/h)
    const speedMap = {
      driving: 50,
      walking: 5,
      cycling: 20,
    };

    const speedKmh = speedMap[mode] || 50;
    const distanceKm = distanceMeters / 1000;
    const etaSeconds = Math.ceil((distanceKm / speedKmh) * 3600);

    return {
      etaSeconds,
      distanceMeters: Math.ceil(distanceMeters),
      polyline: null,
      steps: [],
      provider: "fallback",
      reliabilityScore: 0.6, // Lower reliability for fallback
      providerMeta: {
        providerName: "fallback-haversine",
        travelTimeVariance: 0.3, // Higher variance for fallback
        timestamp: new Date().toISOString(),
        speedUsedKmh: speedKmh,
      },
    };
  }

  /**
   * Calculate distance between two coordinates using haversine formula
   * Returns distance in meters
   */
  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Compute reliability score for ETA
   * Returns score between 0 and 1
   */
  computeReliabilityScore(etaSeconds) {
    // Convert to hours
    const etaHours = etaSeconds / 3600;

    // Base variance increases with time
    let variance = 0.15; // 15% base variance
    if (etaHours > 6) {
      variance += 0.1;
    } else if (etaHours > 1) {
      variance += 0.05;
    }

    // Reliability = inverse of variance, normalized
    const reliabilityScore = Math.max(0.3, Math.min(1, 1 - variance));
    return parseFloat(reliabilityScore.toFixed(2));
  }

  /**
   * Validate coordinates are valid
   */
  validateCoordinates(lat, lng) {
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw new AppError(
        ERROR_CODES.INVALID_COORDINATES,
        "Latitude and longitude must be numbers",
        400
      );
    }

    if (lat < -90 || lat > 90) {
      throw new AppError(
        ERROR_CODES.INVALID_COORDINATES,
        "Latitude must be between -90 and 90",
        400
      );
    }

    if (lng < -180 || lng > 180) {
      throw new AppError(
        ERROR_CODES.INVALID_COORDINATES,
        "Longitude must be between -180 and 180",
        400
      );
    }
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      ttlMs: this.cacheTTL,
    };
  }
}

export default new MapService();
