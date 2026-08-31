const db = require("../Configurations/db.config")


const getAllHolidays = async() => {

    const [rows] = await db.execute(`
        SELECT
         holiday_date ,
         occasion 
         FROM holidays
         ORDER BY holiday_date ASC
        `)
        return rows;
}

module.exports = {
    getAllHolidays
}