import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import {
  login,
  logout,
  refresh,
  registerBrand,
  registerCreator,
  resendOtp,
  verifyOtp,
} from "./auth.controller";

const router = Router();

router.post("/brand/register", registerBrand);
router.post("/creator/register", registerCreator);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);
router.post("/resend-otp", resendOtp);

export const authRoutes = router;
