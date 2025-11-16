import nodemailer from "nodemailer";
import env from "../config/env.js";
import logger from "../utils/logger.js";

let transporter;

if (env.mail.host && env.mail.user && env.mail.pass) {
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: {
      user: env.mail.user,
      pass: env.mail.pass,
    },
  });
}

export const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    logger.warn("Mailer not configured, skipping email send");
    return;
  }

  await transporter.sendMail({
    from: env.mail.from,
    to,
    subject,
    html,
    text,
  });
};
