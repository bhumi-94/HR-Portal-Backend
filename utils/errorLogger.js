const logError = (req, error) => {
  console.error("========================================");
  console.error("ERROR LOG");
  console.error("Date:", new Date().toISOString());
  console.error("User ID:", req.user?.id || "N/A");
  console.error("API:", `${req.method} ${req.originalUrl}`);
  console.error("Error:", error.message);
  console.error("Stack:", error.stack);
  console.error("========================================");
};

module.exports = logError;