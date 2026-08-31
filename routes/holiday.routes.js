const express = require("express");
const router = express.Router();
const { getAllHolidays } = require("../Controllers/holiday.controller");


router.get("/get-holidays" , getAllHolidays)

module.exports = router;