const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/subscription.controller");

router.get("/plans", asyncHandler(controller.getPlans));


module.exports = router;