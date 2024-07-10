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
router.get("/product", validasiJwt, controllerProduk.dataProdukAdmin);
router.delete("/product", validasiJwt, controllerProduk.hapusProduk);
router.delete("/product/variant", validasiJwt, controllerProduk.hapusVarianProduk);
router.put("/product", validasiJwt, controllerProduk.updateProduk);
router.put("/product/variant", validasiJwt, controllerProduk.updateVarianProduk);
router.post("/product/image", validasiJwt, expressFileupload(), controllerProduk.tambahFotoProduk);
router.delete("/product/image", validasiJwt, controllerProduk.hapusFotoProduk);
router.put("/product/image/position", validasiJwt, controllerProduk.updatePosisiFotoProduk);
router.put("/product/image", validasiJwt, expressFileupload(), controllerProduk.updateFotoProduk);

export default router;