const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const controller = require("../controllers/subscription.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/plans", asyncHandler(controller.getPlans));

router.get("/current", auth, asyncHandler(controller.getCurrent));

router.post("/", auth, asyncHandler(controller.subscribe));


module.exports = router;