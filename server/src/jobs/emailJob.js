import logger from "../utils/logger.js";

/**
 * Placeholder email job processor. In production this would be executed by a
 * worker pulling messages from a queue (BullMQ, RabbitMQ, etc.). For now we
 * expose a simple async function that can be awaited by services.
 */
export const sendEmailJob = async ({
  to,
  subject,
  html,
  text,
  metadata = {},
}) => {
  if (!to) {
    throw new Error("emailJob: missing recipient address");
  }

  logger.info(
    { to, subject, metadata },
    "emailJob: sending email via configured provider"
  );

  // TODO: integrate with SendGrid/Mailgun client.
  return { to, subject, queuedAt: new Date().toISOString() };
};

export default sendEmailJob;
