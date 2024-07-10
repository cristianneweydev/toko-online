import express from "express";
import controllerProduk from "../controllers/produk";

const router = express.Router();

router.get("/product/client", controllerProduk.dataProdukClient);

export default router;