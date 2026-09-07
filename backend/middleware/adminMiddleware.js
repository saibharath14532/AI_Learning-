// ─── Admin Middleware ────────────────────────────────────────────────────────
// Verifies user is authenticated (via protect middleware) and has admin role.

export const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.',
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    next();
  } catch (error) {
    console.error(`Admin Middleware Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error verifying admin authorization',
    });
  }
};

export default adminMiddleware;
