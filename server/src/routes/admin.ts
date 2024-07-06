import express from "express";
import { rateLimit } from "express-rate-limit";
import ControllerAuth from "../controllers/Auth";

const router = express.Router();
const rateLimiter = rateLimit({
    windowMs: 1000 * 60, // jeda request selama 1 jam
    limit: 20, // jumlah batas request
});

router.post("/auth/login", rateLimiter, ControllerAuth.login);

export default router;