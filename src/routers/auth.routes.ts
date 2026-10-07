import { Router } from "express";
import { login, logout } from "../controllers/auth.controller";
import { isLoggedIn } from "../middlewares/isLoggedIn";

const router = Router();

router.post("/login", login);
router.post("/logout", isLoggedIn, logout);

export default router;