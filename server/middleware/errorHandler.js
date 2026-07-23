/**
 * Centralized Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode >= 400 ? statusCode : 500).json({
    message: err.message || 'An internal server error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
