const express = require("express");
const router = express.Router();
const testimonioController = require("../controllers/testimonialController");

router.get("/getAllTestimonial", testimonioController.getAllTestimonios);
router.get("/getTestimonialById/:id", testimonioController.getTestimonioByUserId);
router.post("/createTestimonial", testimonioController.createTestimonio);
router.put("/updateTestimonial/:id", testimonioController.updateTestimonio);
router.put("/updateStatusTestimonial/:id", testimonioController.updateTestimonioStatus)


router.delete("/deleteTestimonial/:id", testimonioController.deleteTestimonio);



module.exports = router;

