import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import AdminLog from "../schemas/AdminLog.js";

const buildToken = () =>
  jwt.sign(
    {
      email: env.auth.email,
      role: "super_admin",
    },
    env.auth.jwtSecret,
    { expiresIn: env.auth.jwtExpiresIn }
  );

const logAction = async (action, metadata = {}) => {
  await AdminLog.create({
    superAdminEmail: env.auth.email,
    action,
    metadata,
  });
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (email !== env.auth.email || password !== env.auth.password) {
    return res.status(401).json({
      success: false,
      error: "Invalid super admin credentials",
    });
  }

  const token = buildToken();
  await logAction("super_admin_login", { email });

  res.json({
    success: true,
    data: {
      token,
      profile: {
        email: env.auth.email,
        role: "super_admin",
      },
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      email: env.auth.email,
      role: "super_admin",
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await logAction("super_admin_logout");
  res.json({ success: true });
});
