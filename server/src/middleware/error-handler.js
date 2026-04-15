export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.name === "MulterError" ? 400 : 500);
  const message =
    err.message ||
    (err.name === "MulterError" ? "Upload failed because the file was invalid" : "Internal server error");

  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
