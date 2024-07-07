import { Respon } from "./AliasInterface";
import dbConnectionHandler from "../utils/dbConnectionHandler";
import database from "../configs/database";
import fileSystem, { watch } from "fs";
import pembacaEkstensiFile from "../utils/pembacaEkstensiFile";

type InputTambahProduk = {
    nama: string;
    deskripsi: string;
    foto: any;
};

type InputTambahVarianProduk = {
    idProduk: number;
    nama: string;
    harga: number;
    stok: number;
    berat: number;
};

class Produk {
    pathFolderProduk: string;

    constructor() {
        this.pathFolderProduk = "./public/images/products";
    };

    hapusNamaFolderProduk(inputPathFolder: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const resultFolderProduk = await fileSystem.existsSync(inputPathFolder);
                if (resultFolderProduk === true) {
                    await fileSystem.rmdirSync(inputPathFolder, { recursive: true });
                    resolve("BERHASIL MENGHAPUS FOLDER" + inputPathFolder);
                } else resolve(`PATH ${ inputPathFolder } TIDAK DITEMUKAN`);
            } catch(error) {
                reject(error);
            };
        });
    };

    tambahProduk(input: InputTambahProduk): Promise<Respon> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            let pathNamaFolderProduk: any = null;
            try {
                dbConnection = await database.promise().getConnection();
                const sql = {
                    query: {
                        cariNamaProduk: "SELECT nama FROM produk WHERE LOWER(nama) = LOWER(?) LIMIT 1",
                        insertProduk: "INSERT INTO produk (nama, deskripsi) VALUES (?, ?)",
                    },
                    input: {
                        cariNamaProduk: [input.nama],
                        insertProduk: [input.nama, input.deskripsi],
                    },
                };
                const [resultCariNamaProduk] = await dbConnection.query(sql.query.cariNamaProduk, sql.input.cariNamaProduk);
                if (resultCariNamaProduk.length === 1) resolve({
                    status: 409,
                    pesan: "PRODUK DENGAN NAMA YANG SAMA SUDAH ADA",
                });
                else {
                    await dbConnection.beginTransaction();
                    const [resultInsertProduk] = await dbConnection.query(sql.query.insertProduk, sql.input.insertProduk);
                    pathNamaFolderProduk = this.pathFolderProduk + "/" + input.nama.replace(/\s/g, "-");
                    await fileSystem.mkdirSync(pathNamaFolderProduk);
                    let callBackUploadFileFoto = null;
                    input.foto.map((inputFotoMap, index) => {
                        const namaFileFoto = index + pembacaEkstensiFile(inputFotoMap.name);
                        const pathUploadFileFoto = pathNamaFolderProduk + "/" + namaFileFoto;
                        inputFotoMap.mv(pathUploadFileFoto, (error => {
                            if (error) callBackUploadFileFoto = error;
                        }));
                    });
                    if (callBackUploadFileFoto !== null) throw callBackUploadFileFoto;
                    dbConnection.commit();

                    interface ResponBerhasil extends Respon { idInsert: number };

                    const responBerhasil: ResponBerhasil = {
                        status: 201,
                        pesan: "PRODUK BERHASIL DITAMBAHKAN",
                        idInsert: resultInsertProduk.insertId,
                    };
                    resolve(responBerhasil);
                };
            } catch(error) {
                dbConnection.rollback();
                if (pathNamaFolderProduk !== null) await this.hapusNamaFolderProduk(pathNamaFolderProduk);
                reject(error);
            };
            dbConnection.release();
        });
    };

    tambahVarianProduk(input: InputTambahVarianProduk): Promise<Respon> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            try {
                dbConnection = await database.promise().getConnection();
                const sql = {
                    query: {
                        cariIdProduk: "SELECT id FROM produk WHERE id = ? LIMIT 1",
                        cariNamaVarianProduk: "SELECT nama FROM varian_produk WHERE LOWER(nama) = LOWER(?) LIMIT 1",
                        insertVarianProduk: "INSERT INTO varian_produk (id_produk, nama, harga, stok, berat) VALUES (?, ?, ?, ?, ?)",
                    },
                    input: {
                        cariIdProduk: [input.idProduk],
                        cariNamaVarianProduk: [input.nama],
                        insertVarianProduk:[input.idProduk, input.nama, input.harga, input.stok, input.berat],
                    },
                };
                const [resultCariIdProduk] = await dbConnection.query(sql.query.cariIdProduk, sql.input.cariIdProduk);
                if (resultCariIdProduk.length === 0) resolve({
                    status: 404,
                    pesan: "ID PRODUK TIDAK DITEMUKAN",
                });
                else {
                    const [resultCariNamaVarianProduk] = await dbConnection.query(sql.query.cariNamaVarianProduk, sql.input.cariNamaVarianProduk);
                    if (resultCariNamaVarianProduk.length === 1) resolve({
                        status: 409,
                        pesan: "VARIAN PRODUK DENGAN NAMA YANG SAMA SUDAH ADA",
                    });
                    else {
                        await dbConnection.beginTransaction();
                        await dbConnection.query(sql.query.insertVarianProduk, sql.input.insertVarianProduk);
                        dbConnection.commit();
                        resolve({
                            status: 201,
                            pesan: "VARIAN PRODUK BERHASIL DITAMBAHKAN",
                        });
                    };
                };
            } catch(error) {
                dbConnection.rollback();
                reject(error);
            };
            dbConnection.release();
        });
    };
};

export default new Produk();