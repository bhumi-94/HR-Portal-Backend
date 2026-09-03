const dotenv = require("dotenv")
dotenv.config()
const app = require("./src/app")


require("./Jobs/holidayNotification.job");

const PORT=process.env.PORT
app.listen(PORT , "0.0.0.0" ,() => {
    console.log(`👋Welcome to the Backend World 🚀Server is running at ${PORT}`)
})