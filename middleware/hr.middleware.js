const hrMiddleware = (req, res, next) => {
  if (req.user.role !== 1) {
    return res.status(403).json({
      success: false,
      message: "HR access required"
    });
  }

  next();
};

module.exports = hrMiddleware;