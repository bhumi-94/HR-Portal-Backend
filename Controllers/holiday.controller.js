const holidayService = require("../Services/holiday.service")
const db = require("../Configurations/db.config")


const getAllHolidays = async(req , res) => {
    
    try{
        const holidays = await holidayService.getAllHolidays()

        return res.status(200).json({
            success : true,
            holidays : holidays,
        })
    }catch(error){
        console.log(error)

        return res.status(500).json({
            success : false,
            message : error.message || "Failed to fetch holidays"
        })
    }
}

module.exports = { getAllHolidays }