const express = require("express")
const router = express.Router()
const { getCompaniesWithAddressAndSocialLinks,getServices,getSchedules,getAppointmentByFolio } = require("../controllers/wearOsController")

router.get("/getWearOsCompany", getCompaniesWithAddressAndSocialLinks)

router.get("/getWearOsServices", getServices)

router.get("/getWearOsSchedules", getSchedules)

router.get('/getWearOsAppointments/:folio',getAppointmentByFolio );

module.exports = router