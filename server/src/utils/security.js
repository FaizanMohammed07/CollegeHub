import bcryptjs from "bcryptjs";

/**
 * Hash password with bcrypt
 */
export const hashPassword = async (password) => {
  const salt = await bcryptjs.genSalt(
    parseInt(process.env.BCRYPT_ROUNDS || 10)
  );
  return bcryptjs.hash(password, salt);
};

/**
 * Compare plain password with hashed password
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcryptjs.compare(plainPassword, hashedPassword);
};

/**
 * Validate password strength
 * Minimum 8 chars, at least one uppercase, one lowercase, one number, one special char
 */
export const validatePasswordStrength = (password) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

/**
 * Generate random secure token
 */
export const generateRandomToken = (length = 32) => {
  return require("crypto").randomBytes(length).toString("hex");
};
