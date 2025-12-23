const errorHandler = (err, req, res, next) => {
  // Log the error for debugging purposes
  console.error(`ERROR: ${err.message}`);
  console.error(err.stack);

  // Default error response
  const errorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    errorResponse.message = `Resource not found with id of ${err.value}`;
    return res.status(404).json(errorResponse);
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    errorResponse.message = `Duplicate field value entered for '${field}'. Please use another value.`;
    return res.status(400).json(errorResponse);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    errorResponse.message = messages.join(', ');
    return res.status(400).json(errorResponse);
  }

  res.status(err.statusCode || 500).json(errorResponse);
};

module.exports = errorHandler;
