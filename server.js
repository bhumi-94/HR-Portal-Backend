const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
require("./Jobs/holidayNotification.job");
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `👋 Welcome to the Backend World 🚀 Server is running at ${PORT}`
  );
});