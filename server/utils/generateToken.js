import jwt from 'jsonwebtoken';

/**
 * Signs a JWT containing the user's id and role.
 * Role is embedded so authMiddleware can do role checks
 * without an extra DB round-trip on every request.
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export default generateToken;
