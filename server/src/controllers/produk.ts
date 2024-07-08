import { Request, Response } from "express";
import model from "../models/produk";

class Produk {
    async tambahProduk(request: Request, response: Response) {
        try {
            const inputBody = request.body;
            const inputfile = request.files;
            if (
                typeof inputBody.nama !== "string"
                || typeof inputBody.deskripsi !== "string"
                || !inputfile
                || !inputfile.foto
            ) response.send(400);
            else {
                if (!Array.isArray(inputfile.foto)) inputfile.foto = [inputfile.foto]; // parsing foto menjadi array
                let penolakanFileFoto = false;
                inputfile.foto.map((inputFileFotoMap) => {
                    if (inputFileFotoMap.mimetype !== "image/png" && inputFileFotoMap.mimetype !== "image/jpeg") penolakanFileFoto = true;
                });
                if (penolakanFileFoto !== false) response.send(400);
                else {
                    const resultModel = await model.tambahProduk({
                        nama: inputBody.nama,
                        deskripsi: inputBody.deskripsi,
                        foto: inputfile.foto,
                    });
                    response.status(resultModel.status).json(resultModel);
                };
            };
        } catch(error) {
            console.error({
                error,
                pesan: "SERVICE API ERROR",
            });
            response.send(500);
        };
    };

    async tambahVarianProduk(request: Request, response: Response) {
        try {
            const inputBody = request.body;
            if (
                typeof inputBody.idProduk !== "number"
                || typeof inputBody.nama !== "string"
                || typeof inputBody.harga !== "number"
                || typeof inputBody.stok !== "number"
                || typeof inputBody.berat !== "number"
            ) response.send(400);
            else {
                const resultModel = await model.tambahVarianProduk({
                    idProduk: inputBody.idProduk,
                    nama: inputBody.nama,
                    harga: inputBody.harga,
                    stok: inputBody.stok,
                    berat: inputBody.berat,
                });
                response.status(resultModel.status).json(resultModel);
            };
        } catch(error) {
            console.error({
                error,
                pesan: "SERVICE API ERROR",
            });
            response.send(500);
        };
    };

    async dataProdukAdmin(request: Request, response: Response) {
        try {
            const inputQueryPagination: any = request.query.pagination;
            if (
                inputQueryPagination
                && (Array.isArray(inputQueryPagination) || isNaN(inputQueryPagination))
            ) response.send(400);
            else {
                const inputPagination = inputQueryPagination ? Number(inputQueryPagination) : 0;
                const resultModel = await model.dataProdukAdmin(inputPagination);
                response.status(resultModel.status).json(resultModel);
            };
        } catch(error) {
            console.error({
                error,
                pesan: "SERVICE API ERROR",
            });
            response.send(500);
        };
    };
};

export default new Produk();