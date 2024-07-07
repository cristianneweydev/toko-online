import { Respon } from "./AliasInterface";
import dbConnectionHandler from "../utils/dbConnectionHandler";
import database from "../configs/database";
import fileSystem from "fs";
import pembacaEkstensiFile from "../utils/pembacaEkstensiFile";

type InputTambahProduk = {
    nama: string;
    deskripsi: string;
    foto: any;
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
                    await dbConnection.query(sql.query.insertProduk, sql.input.insertProduk);
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
                    resolve({
                        status: 201,
                        pesan: "PRODUK BERHASIL DITAMBAHKAN",
                    });
                };
            } catch(error) {
                dbConnection.rollback();
                if (pathNamaFolderProduk !== null) await this.hapusNamaFolderProduk(pathNamaFolderProduk);
                reject(error);
            };
            dbConnection.release();
        });
    };
};

export default new Produk();