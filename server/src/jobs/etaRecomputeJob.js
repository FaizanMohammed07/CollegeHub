import logger from "../utils/logger.js";
import mapService from "../services/mapService.js";

/**
 * Background job to recompute ETA when an event or user location changes.
 * Hook this into a queue runner later. For now we expose a function that can
 * be triggered manually from services.
 */
export const recomputeEtaJob = async ({
  registrationId,
  eventLocation,
  userLocation,
}) => {
  if (!registrationId || !eventLocation || !userLocation) {
    logger.warn(
      { registrationId, eventLocation, userLocation },
      "etaRecomputeJob: missing required payload"
    );
    return null;
  }

  try {
    const eta = await mapService.getEta(userLocation, eventLocation);
    logger.info({ registrationId, eta }, "etaRecomputeJob: recomputed ETA");
    return eta;
  } catch (error) {
    logger.error(
      { error, registrationId },
      "etaRecomputeJob: failed to recompute ETA"
    );
    throw error;
  }
};

export default recomputeEtaJob;
