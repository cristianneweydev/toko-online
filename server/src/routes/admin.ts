import express from "express";
import { rateLimit } from "express-rate-limit";
import controllerAuth from "../controllers/auth";
import validasiJwt from "../middlewares/validasiJwt";
import expressFileupload from "express-fileupload";
import controllerProduk from "../controllers/produk";

const router = express.Router();
const rateLimiter = rateLimit({
    windowMs: 1000 * 60, // jeda request selama 1 jam
    limit: 20, // jumlah batas request
});

router.post("/auth/login", rateLimiter, controllerAuth.login);

router.post("/product", validasiJwt, expressFileupload(), controllerProduk.tambahProduk);
router.post("/product/variant", validasiJwt, controllerProduk.tambahVarianProduk);

export default router;