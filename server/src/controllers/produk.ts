import { Request, Response } from "express";
import model from "../models/produk";

class Produk {
    async tambahProduk(request: Request, response: Response) {
        try {
            const inputBody = request.body;
            const inputFile = request.files;
            if (
                typeof inputBody.nama !== "string"
                || typeof inputBody.deskripsi !== "string"
                || !inputFile
                || !inputFile.foto
            ) response.send(400);
            else {
                if (!Array.isArray(inputFile.foto)) inputFile.foto = [inputFile.foto]; // parsing foto menjadi array
                let penolakanFileFoto = false;
                inputFile.foto.map((inputFileFotoMap) => {
                    if (inputFileFotoMap.mimetype !== "image/png" && inputFileFotoMap.mimetype !== "image/jpeg") penolakanFileFoto = true;
                });
                if (penolakanFileFoto !== false) response.send(400);
                else {
                    const resultModel = await model.tambahProduk({
                        nama: inputBody.nama,
                        deskripsi: inputBody.deskripsi,
                        foto: inputFile.foto,
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
                const resultModel = await model.tambahVarianProduk(inputBody);
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

    async hapusProduk(request: Request, response: Response) {
        try {
            const inputQueryId: any = request.query.id;
            if (Array.isArray(inputQueryId) || isNaN(inputQueryId)) response.send(400);
            else {
                const resultModel = await model.hapusProduk(Number(inputQueryId));
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

    async hapusVarianProduk(request: Request, response: Response) {
        try {
            const inputQueryId: any = request.query.id;
            if (Array.isArray(inputQueryId) || isNaN(inputQueryId)) response.send(400);
            else {
                const resultModel = await model.hapusVarianProduk(Number(inputQueryId));
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

    async updateProduk(request: Request, response: Response) {
        try {
            const inputBody = request.body;
            if (
                typeof inputBody.id !== "number"
                || (
                    inputBody.nama === undefined
                    && inputBody.deskripsi === undefined
                    && inputBody.tampilkan === undefined
                )
            ) response.send(400);
            else if (inputBody.nama && typeof inputBody.nama !== "string") response.send(400);
            else if (inputBody.deskripsi && typeof inputBody.deskripsi !== "string") response.send(400);
            else if (inputBody.tampilkan && typeof inputBody.tampilkan !== "boolean") response.send(400);
            else {
                const resultModel = await model.updateProduk(inputBody);
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

    async updateVarianProduk(request: Request, response: Response) {
        try {
            const inputBody = request.body;
            if (
                typeof inputBody.id !== "number"
                || (
                    !inputBody.nama
                    && !inputBody.harga
                    && !inputBody.stok
                    && !inputBody.berat
                )
            ) response.send(400);
            else if (inputBody.nama && typeof inputBody.nama !== "string") response.send(400);
            else if (inputBody.harga && typeof inputBody.harga !== "number") response.send(400);
            else if (inputBody.stok && typeof inputBody.stok !== "number") response.send(400);
            else if (inputBody.berat && typeof inputBody.berat !== "number") response.send(400);
            else {
                const resultModel = await model.updateVarianProduk(inputBody);
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

    async tambahFotoProduk(request: Request, response: Response) {
        try {
            const inputBodyId = request.body.id;
            const inputFile = request.files;
            if (
                Array.isArray(inputBodyId)
                || isNaN(inputBodyId)
                || !inputFile
                || !inputFile.foto
            ) response.send(400);
            else {
                if (!Array.isArray(inputFile.foto)) inputFile.foto = [inputFile.foto]; // parsing foto menjadi array
                let penolakanFileFoto = false;
                inputFile.foto.map((inputFileFotoMap) => {
                    if (inputFileFotoMap.mimetype !== "image/png" && inputFileFotoMap.mimetype !== "image/jpeg") penolakanFileFoto = true;
                });
                if (penolakanFileFoto !== false) response.send(400);
                else {
                    const resultModel = await model.tambahFotoProduk({
                        id: Number(inputBodyId),
                        foto: inputFile.foto,
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

    async hapusFotoProduk(request: Request, response: Response) {
        try {
            const inputBody = request.body;
            if (typeof inputBody.id !== "number" || typeof inputBody.index !== "number") response.send(400);
            else {
                const resultModel = await model.hapusFotoProduk(inputBody);
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

    async updatePosisiFotoProduk(request: Request, response: Response) {
        try {
            const inputBody = request.body;
            if (
                typeof inputBody.id !== "number"
                || typeof inputBody.dariIndex !== "number"
                || typeof inputBody.keIndex !== "number"
            ) response.send(400);
            else {
                const resultModel = await model.updatePosisiFotoProduk(inputBody);
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

    async updateFotoProduk(request: Request, response: Response) {
        try {
            const inputBody = request.body;
            const inputFile = request.files;
            if (
                Array.isArray(inputBody.id)
                || isNaN(inputBody.id)
                || Array.isArray(inputBody.index)
                || isNaN(inputBody.index)
                || !inputFile
                || !inputFile.foto
                || Array.isArray(inputFile.foto)
            ) response.send(400);
            else {
                const resultModel = await model.updateFotoProduk({
                    id: Number(inputBody.id),
                    index: Number(inputBody.index),
                    foto: inputFile.foto,
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

    async dataProdukClient(request: Request, response: Response) {
        try {
            const inputQueryPagination: any = request.query.pagination;
            if (
                inputQueryPagination
                && (Array.isArray(inputQueryPagination) || isNaN(inputQueryPagination))
            ) response.send(400);
            else {
                const inputPagination = inputQueryPagination ? Number(inputQueryPagination) : 0;
                const resultModel = await model.dataProdukClient(inputPagination);
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