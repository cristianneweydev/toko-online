import { Respon } from "./AliasInterface";
import dbConnectionHandler from "../utils/dbConnectionHandler";
import database from "../configs/database";
import fileSystem, { promises as fileSystemPromise } from "fs";
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

interface ResponDataProduk extends Respon {
    panjangData: Record<string, number>;
    data: Array<any> | null;
};

type InputUbahProduk = {
    id: number,
    nama: string;
    deskripsi: string;
    tampilkan: boolean;
};

type InputUbahVarianProduk = {
    id: number,
    nama: string;
    harga: number;
    stok: number;
    berat: number;
};

type InputTambahFotoProduk = {
    id: number;
    foto: any;
};

type InputHapusFotoProduk = {
    id: number;
    index: number;
};

type InputUpdatePosisiFotoProduk = {
    id: number;
    dariIndex: number,
    keIndex: number,
};

class Produk {
    pathFolderProduk: string;
    linkFileFotoProduk: string;
    pathFolderBackupProduk: string;

    constructor() {
        this.pathFolderProduk = "./public/images/products";
        this.linkFileFotoProduk = "/images/products";
        this.pathFolderBackupProduk = "./backups/images/products";
    };

    backUpFolderProduk(inputNamaFolderProduk: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const pathNamaFolderProduk = this.pathFolderProduk + "/" + inputNamaFolderProduk;
                const resultFolderProduk = fileSystem.existsSync(pathNamaFolderProduk);
                if (resultFolderProduk === false) resolve(`PATH ${ pathNamaFolderProduk } TIDAK DITEMUKAN`);
                else {
                    const pathNamaFolderBackupProduk = this.pathFolderBackupProduk + "/" + inputNamaFolderProduk;
                    await fileSystemPromise.mkdir(pathNamaFolderBackupProduk);
                    await fileSystemPromise.cp(pathNamaFolderProduk, pathNamaFolderBackupProduk, { recursive: true });
                    resolve(`BERHASIL MEMBACKUP FOLDER ${ pathNamaFolderProduk } KE ${ pathNamaFolderBackupProduk }`);
                };
            } catch(error) {
                reject(error);
            };
        });
    };

    hapusFolderProduk(inputPathFolder: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const resultFolderProduk = fileSystem.existsSync(inputPathFolder);
                if (resultFolderProduk === false) resolve(`PATH ${ inputPathFolder } TIDAK DITEMUKAN`);
                else {
                    await fileSystemPromise.rmdir(inputPathFolder, { recursive: true });
                    resolve("BERHASIL MENGHAPUS FOLDER " + inputPathFolder); 
                };
            } catch(error) {
                reject(error);
            };
        });
    };

    kembalikanFolderProduk(inputNamaFolderProduk: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const pathNamaFolderBackupProduk = this.pathFolderBackupProduk + "/" + inputNamaFolderProduk;
                const resultFolderProduk = await fileSystem.existsSync(pathNamaFolderBackupProduk);
                if (resultFolderProduk === false) resolve(`PATH ${ pathNamaFolderBackupProduk } TIDAK DITEMUKAN`);
                else {
                    const pathNamaFolderProduk = this.pathFolderProduk + "/" + inputNamaFolderProduk;
                    await fileSystemPromise.mkdir(pathNamaFolderProduk);
                    await fileSystemPromise.cp(pathNamaFolderBackupProduk, pathNamaFolderProduk, { recursive: true });
                    resolve(`BERHASIL MENGEMBALIKAN FOLDER ${ pathNamaFolderBackupProduk } KE ${ pathNamaFolderProduk }`);
                };
            } catch(error) {
                reject(error);
            };
        });
    };

    tambahProduk(input: InputTambahProduk): Promise<Respon> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            let pathNamaFolderProduk: null | string = null;
            let callBackErrorHapusFolderProduk = false;
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
                    const regexSpasi = /\s/g;
                    pathNamaFolderProduk = this.pathFolderProduk + "/" + input.nama.replace(regexSpasi, "-");
                    await fileSystemPromise.mkdir(pathNamaFolderProduk);
                    callBackErrorHapusFolderProduk = true;
                    let callBackUploadFileFoto = null;
                    input.foto.map((inputFotoMap, index) => {
                        const namaFileFoto = index + pembacaEkstensiFile(inputFotoMap.name);
                        const pathUploadFileFoto = pathNamaFolderProduk + "/" + namaFileFoto;
                        inputFotoMap.mv(pathUploadFileFoto, (error) => {
                            if (error) callBackUploadFileFoto = error;
                        });
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
                if (callBackErrorHapusFolderProduk === true) await this.hapusFolderProduk(pathNamaFolderProduk || "default");
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
                        cariNamaVarianProduk: "SELECT nama FROM varian_produk WHERE id_produk = ? AND LOWER(nama) = LOWER(?) LIMIT 1",
                        insertVarianProduk: "INSERT INTO varian_produk (id_produk, nama, harga, stok, berat) VALUES (?, ?, ?, ?, ?)",
                    },
                    input: {
                        cariIdProduk: [input.idProduk],
                        cariNamaVarianProduk: [input.idProduk, input.nama],
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

    dataProdukAdmin(inputPagination: number): Promise<ResponDataProduk> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            try {
                dbConnection = await database.promise().getConnection();
                const sql = {
                    query: {
                        cariSemuaProduk: "SELECT * FROM produk ORDER BY id DESC LIMIT 5 OFFSET ?",
                        cariIdProdukVarianProduk: "SELECT id, nama, harga, stok, berat FROM varian_produk WHERE id_produk = ? ORDER BY id DESC",
                        panjangTabel: "SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'toko_online' AND TABLE_NAME = 'produk'",
                    },
                    input: {
                        cariSemuaProduk: [inputPagination * 5],
                        cariIdProdukVarianProduk: ["default"],
                    },
                };
                const [resultPanjangTabel] = await dbConnection.query(sql.query.panjangTabel);
                const [resultCariSemuaProduk] = await dbConnection.query(sql.query.cariSemuaProduk, sql.input.cariSemuaProduk);
                for (let urutan = 0; urutan < resultCariSemuaProduk.length; urutan++) {
                    resultCariSemuaProduk[urutan].tampilkan = resultCariSemuaProduk[urutan].tampilkan === 1 ? true : false;

                    sql.input.cariIdProdukVarianProduk[0] = resultCariSemuaProduk[urutan].id;
                    const [resultIdProdukVarianProduk] = await dbConnection.query(sql.query.cariIdProdukVarianProduk, sql.input.cariIdProdukVarianProduk);
                    resultCariSemuaProduk[urutan].varian = resultIdProdukVarianProduk.length > 0 ? resultIdProdukVarianProduk : null;

                    const regexSpasi = /\s/g;
                    const namaFolderProduk = resultCariSemuaProduk[urutan].nama.replace(regexSpasi, "-");
                    const pathNamaFolderProduk = this.pathFolderProduk + "/" + namaFolderProduk;
                    const resultFileFoto = await fileSystemPromise.readdir(pathNamaFolderProduk);
                    resultFileFoto.sort((resultFileFotoSortA, resultFileFotoSortB) => {
                        const regexAngka = /[0-9]+/;
                        const cariAngkaA = resultFileFotoSortA.match(regexAngka) || "default";
                        const cariAngkaB = resultFileFotoSortB.match(regexAngka) || "default";
                        return Number(cariAngkaA[0]) - Number(cariAngkaB[0]);
                    });
                    for (let urutanFileFoto = 0; urutanFileFoto < resultFileFoto.length; urutanFileFoto++) {
                        const linkFileFoto = this.linkFileFotoProduk + "/" + namaFolderProduk + "/" + resultFileFoto[urutanFileFoto];
                        resultFileFoto[urutanFileFoto] = linkFileFoto;
                    };
                    resultCariSemuaProduk[urutan].foto = resultFileFoto;
                };
                resolve({
                    status: 200,
                    pesan: "BERHASIL MENAMPILKAN DATA PRODUK",
                    panjangData: {
                        keseluruhan: resultPanjangTabel[0].TABLE_ROWS,
                        pagination: resultCariSemuaProduk.length,
                    },
                    data: resultCariSemuaProduk.length > 0 ? resultCariSemuaProduk : null,
                });
            } catch(error) {
                reject(error);
            };
            dbConnection.release();
        });
    };

    hapusProduk(inputId: number): Promise<Respon> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            try {
                dbConnection = await database.promise().getConnection();
                const sql = {
                    query: {
                        cariIdProduk: "SELECT id, nama FROM produk WHERE id = ? LIMIT 1",
                        hapusProduk: "DELETE FROM produk WHERE id = ?",
                    },
                    input: {
                        cariIdProduk: [inputId],
                        hapusProduk: [inputId],
                    },
                };
                const [resultCariIdProduk] = await dbConnection.query(sql.query.cariIdProduk, sql.input.cariIdProduk);
                if (resultCariIdProduk.length === 0) resolve({
                    status: 404,
                    pesan: "PRODUK TIDAK DITEMUKAN",
                });
                else {
                    await dbConnection.beginTransaction();
                    await dbConnection.query(sql.query.hapusProduk, sql.input.hapusProduk);
                    const regexSpasi = /\s/g;
                    const namaFolderProduk = resultCariIdProduk[0].nama.replace(regexSpasi, "-");
                    await this.backUpFolderProduk(namaFolderProduk);
                    const pathNamaFolderProduk = this.pathFolderProduk + "/" + namaFolderProduk;
                    await this.hapusFolderProduk(pathNamaFolderProduk);
                    const pathNamaFolderBackupProduk = this.pathFolderBackupProduk + "/" + namaFolderProduk;
                    await this.hapusFolderProduk(pathNamaFolderBackupProduk);
                    dbConnection.commit();
                    resolve({
                        status: 200,
                        pesan: "BERHASIL MENGHAPUS PRODUK",
                    });
                };
            } catch(error) {
                dbConnection.rollback();
                reject(error);
            };
            dbConnection.release();
        });
    };

    hapusVarianProduk(inputId: number): Promise<Respon> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            try {
                dbConnection = await database.promise().getConnection();
                const sql = {
                    query: {
                        cariIdVarianProduk: "SELECT id FROM varian_produk WHERE id = ? LIMIT 1",
                        hapusVarianProduk: "DELETE FROM varian_produk WHERE id = ?",
                    },
                    input: {
                        cariIdVarianProduk: [inputId],
                        hapusVarianProduk: [inputId],
                    },
                };
                const [resultCariIdVarianProduk] = await dbConnection.query(sql.query.cariIdVarianProduk, sql.input.cariIdVarianProduk);
                if (resultCariIdVarianProduk.length === 0) resolve({
                    status: 404,
                    pesan: "VARIAN PRODUK TIDAK DITEMUKAN",
                });
                else {
                    await dbConnection.beginTransaction();
                    await dbConnection.query(sql.query.hapusVarianProduk, sql.input.hapusVarianProduk);
                    dbConnection.commit();
                    resolve({
                        status: 200,
                        pesan: "BERHASIL MENGHAPUS VARIAN PRODUK",
                    });
                };
            } catch(error) {
                dbConnection.rollback();
                reject(error);
            };
            dbConnection.release();
        });
    };

    updateProduk(input: InputUbahProduk): Promise<Respon> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            try {
                dbConnection = await database.promise().getConnection();
                const inputTampilkan = input.tampilkan === true ? 1 : 0;
                const sql = {
                    query: {
                        cariNamaProduk: "SELECT nama FROM produk WHERE LOWER(nama) = LOWER(?) LIMIT 1",
                        cariIdProduk: "SELECT id, nama FROM produk WHERE id = ? LIMIT 1",
                        updateProduk: "UPDATE produk SET nama = COALESCE(?, nama), deskripsi = COALESCE(?, deskripsi), tampilkan = COALESCE(?, tampilkan), diperbarui = NOW() WHERE id = ?",
                    },
                    input: {
                        cariNamaProduk: [input.nama],
                        cariIdProduk: [input.id],
                        updateProduk: [input.nama, input.deskripsi, inputTampilkan, input.id],
                    },
                };
                const [resultCariNamaProduk] = await dbConnection.query(sql.query.cariNamaProduk, sql.input.cariNamaProduk);
                if (typeof input.nama === "string" && resultCariNamaProduk.length === 1) resolve({
                    status: 409,
                    pesan: "PRODUK DENGAN NAMA YANG SAMA SUDAH ADA",
                });
                else {
                    const [resultCariIdProduk] = await dbConnection.query(sql.query.cariIdProduk, sql.input.cariIdProduk);
                    if (resultCariIdProduk.length === 0) resolve({
                        status: 404,
                        pesan: "PRODUK TIDAK DITEMUKAN",
                    });
                    else {
                        await dbConnection.beginTransaction();
                        await dbConnection.query(sql.query.updateProduk, sql.input.updateProduk);
                        if (input.nama) {
                            const regexSpasi = /\s/g;
                            const pathNamaFolderProdukLama = this.pathFolderProduk + "/" + resultCariIdProduk[0].nama.replace(regexSpasi ,"-");
                            const pathNamaFolderProdukBaru = this.pathFolderProduk + "/" + input.nama.replace(regexSpasi ,"-");
                            await fileSystemPromise.rename(pathNamaFolderProdukLama, pathNamaFolderProdukBaru);
                        };
                        dbConnection.commit();
                        resolve({
                            status: 200,
                            pesan: "BERHASIL MENGUPDATE PRODUK",
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

    updateVarianProduk(input: InputUbahVarianProduk): Promise<Respon> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            try {
                dbConnection = await database.promise().getConnection();
                const sql = {
                    query: {
                        cariIdVarianProduk: "SELECT id, id_produk FROM varian_produk WHERE id = ? LIMIT 1",
                        cariIdProdukNamaVarianProduk: "SELECT nama FROM varian_produk WHERE id_produk = ? AND LOWER(nama) = LOWER(nama) LIMIT 1",
                        updateVarianProduk: "UPDATE varian_produk SET nama = COALESCE(?, nama), harga = COALESCE(?, harga), stok = COALESCE(?, stok), berat = COALESCE(?, berat) WHERE id = ?",
                    },
                    input: {
                        cariIdVarianProduk: [input.id],
                        cariIdProdukNamaVarianProduk: ["default", input.nama],
                        updateVarianProduk: [input.nama, input.harga, input.stok, input.berat, input.id],
                    },
                };
                const [resultCariIdVarianProduk] = await dbConnection.query(sql.query.cariIdVarianProduk, sql.input.cariIdVarianProduk);
                if (resultCariIdVarianProduk.length === 0) resolve({
                    status: 404,
                    pesan: "VARIAN PRODUK TIDAK DITEMUKAN",
                });
                else {
                    if (typeof input.nama === "string") sql.input.cariIdProdukNamaVarianProduk[0] = resultCariIdVarianProduk[0].id_produk;
                    const [resultCariIdProdukNamaVarianProduk] = await dbConnection.query(sql.query.cariIdProdukNamaVarianProduk, sql.input.cariIdProdukNamaVarianProduk);
                    if (typeof input.nama === "string" && resultCariIdProdukNamaVarianProduk.length === 1) resolve({
                        status: 409,
                        pesan: "VARIAN PRODUK DENGAN NAMA YANG SAMA SUDAH ADA",
                    });
                    else {
                        await dbConnection.beginTransaction();
                        await dbConnection.query(sql.query.updateVarianProduk, sql.input.updateVarianProduk);
                        dbConnection.commit();
                        resolve({
                            status: 200,
                            pesan: "BERHASIL MENGUPDATE VARIAN PRODUK",
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

    tambahFotoProduk(input: InputTambahFotoProduk): Promise<Respon> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            try {
                dbConnection = await database.promise().getConnection();
                const sql = {
                    queryCariIdProduk: "SELECT id, nama FROM produk WHERE id = ? LIMIT 1",
                    inputCariIdProduk: [input.id],
                };
                const [resultCariIdProduk] = await dbConnection.query(sql.queryCariIdProduk, sql.inputCariIdProduk);
                if (resultCariIdProduk.length === 0) resolve({
                    status: 404,
                    pesan: "PRODUK TIDAK DITEMUKAN",
                });
                else {
                    const regexSpasi = /\s/g;
                    const pathNamaFolderProduk = this.pathFolderProduk + "/" + resultCariIdProduk[0].nama.replace(regexSpasi, "-");
                    const resultFileFoto = await fileSystemPromise.readdir(pathNamaFolderProduk);
                    let callBackUploadFileFoto: any = null;
                    input.foto.map((inputFotoMap, index) => {
                        const namaFileFoto = resultFileFoto.length + index + pembacaEkstensiFile(inputFotoMap.name);
                        const pathUploadFileFoto = pathNamaFolderProduk + "/" + namaFileFoto;
                        inputFotoMap.mv(pathUploadFileFoto, (error) => {
                            if (error) callBackUploadFileFoto = error;
                        });
                    });
                    if (callBackUploadFileFoto !== null) throw callBackUploadFileFoto;
                    resolve({
                        status: 201,
                        pesan: "FOTO BERHASIL DITAMBAHKAN KE PRODUK",
                    });
                };
            } catch(error) {
                reject(error);
            };
            dbConnection.release();
        });
    };

    hapusFotoProduk(input: InputHapusFotoProduk): Promise<Respon> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            try {
                dbConnection = await database.promise().getConnection();
                const sql = {
                    queryCariIdProduk: "SELECT id, nama FROM produk WHERE id = ? LIMIT 1",
                    inputCariIdProduk: [input.id],
                };
                const [resultCariIdProduk] = await dbConnection.query(sql.queryCariIdProduk, sql.inputCariIdProduk);
                if (resultCariIdProduk.length === 0) resolve({
                    status: 404,
                    pesan: "PRODUK TIDAK DITEMUKAN",
                });
                else {
                    const regexSpasi = /\s/g;
                    const namaFolderProduk = resultCariIdProduk[0].nama.replace(regexSpasi, "-");
                    const pathNamaFolderProduk = this.pathFolderProduk + "/" + namaFolderProduk;
                    const resultFileFoto = await fileSystemPromise.readdir(pathNamaFolderProduk);
                    resultFileFoto.sort((resultFileFotoSortA, resultFileFotoSortB) => {
                        const regexAngka = /[0-9]+/;
                        const cariAngkaA = resultFileFotoSortA.match(regexAngka) || "default";
                        const cariAngkaB = resultFileFotoSortB.match(regexAngka) || "default";
                        return Number(cariAngkaA[0]) - Number(cariAngkaB[0]);
                    });
                    if (typeof resultFileFoto[input.index] !== "string") resolve({
                        status: 404,
                        pesan: "FOTO TIDAK DITEMUKAN",
                    });
                    else if (resultFileFoto.length === 1) resolve({
                        status: 403,
                        pesan: "TIDAK BOLEH MENGHAPUS SEMUA FOTO",
                    });
                    else {
                        await this.backUpFolderProduk(namaFolderProduk);
                        const pathHapusFileFotoProduk = pathNamaFolderProduk + "/" + resultFileFoto[input.index];
                        await fileSystemPromise.unlink(pathHapusFileFotoProduk);
                        const resultFileFotoRename = await fileSystemPromise.readdir(pathNamaFolderProduk);
                        resultFileFotoRename.sort((resultFileFotoRenameSortA, resultFileFotoRenameSortB) => {
                            const regexAngka = /[0-9]+/;
                            const cariAngkaA = resultFileFotoRenameSortA.match(regexAngka) || "default";
                            const cariAngkaB = resultFileFotoRenameSortB.match(regexAngka) || "default";
                            return Number(cariAngkaA[0]) - Number(cariAngkaB[0]);
                        });
                        for (let urutan = 0; urutan < resultFileFotoRename.length; urutan++) {
                            const pathNamaFileFotoLama = pathNamaFolderProduk + "/" + resultFileFotoRename[urutan];
                            const pathNamaFileFotoBaru = pathNamaFolderProduk + "/" + urutan + pembacaEkstensiFile(resultFileFotoRename[urutan]);
                            await fileSystemPromise.rename(pathNamaFileFotoLama, pathNamaFileFotoBaru);
                        };
                        const pathFolderBackupProduk = this.pathFolderBackupProduk + "/" + namaFolderProduk;
                        await this.hapusFolderProduk(pathFolderBackupProduk);
                        resolve({
                            status: 200,
                            pesan: "BERHASIL MENGHAPUS FOTO PRODUK",
                        });
                    };
                };
            } catch(error) {
                reject(error);
            };
            dbConnection.release();
        });
    };

    updatePosisiFotoProduk(input: InputUpdatePosisiFotoProduk): Promise<Respon> {
        return new Promise(async (resolve, reject) => {
            let dbConnection: any = dbConnectionHandler;
            let namaFolderProduk: null | string = null;
            let pathNamaFolderProduk: null | string = null;
            let pathNamaFolderBackupProduk: null | string = null;
            let callBackErrorCopyFile = false;
            try {
                dbConnection = await database.promise().getConnection();
                const sql = {
                    queryCariIdProduk: "SELECT id, nama FROM produk WHERE id = ? LIMIT 1",
                    inputCariIdProduk: [input.id],
                };
                const [resultCariIdProduk] = await dbConnection.query(sql.queryCariIdProduk, sql.inputCariIdProduk);
                if (resultCariIdProduk.length === 0) resolve({
                    status: 404,
                    pesan: "PRODUK TIDAK DITEMUKAN",
                });
                else if (input.dariIndex === input.keIndex) resolve({
                    status: 403,
                    pesan: "POSISI INDEX FOTO TIDAK BOLEH SAMA",
                });
                else {
                    const regexSpasi = /\s/g;
                    namaFolderProduk = resultCariIdProduk[0].nama.replace(regexSpasi, "-");
                    pathNamaFolderProduk = this.pathFolderProduk + "/" + namaFolderProduk;
                    pathNamaFolderBackupProduk = this.pathFolderBackupProduk + "/" + namaFolderProduk;
                    const resultFileFoto = await fileSystemPromise.readdir(pathNamaFolderProduk);
                    resultFileFoto.sort((resultFileFotoSortA, resultFileFotoSortB) => {
                        const regexAngka = /[0-9]+/;
                        const cariAngkaA = resultFileFotoSortA.match(regexAngka) || "default";
                        const cariAngkaB = resultFileFotoSortB.match(regexAngka) || "default";
                        return Number(cariAngkaA[0]) - Number(cariAngkaB[0]);
                    });
                    if (typeof resultFileFoto[input.dariIndex] !== "string" || typeof resultFileFoto[input.keIndex] !== "string") resolve({
                        status: 404,
                        pesan: "FOTO TIDAK DITEMUKAN",
                    });
                    else {
                        await this.backUpFolderProduk(namaFolderProduk || "default");
                        const pathFolderCopyProduk = pathNamaFolderProduk + "/rename-file" ;
                        callBackErrorCopyFile = true;
                        await fileSystemPromise.mkdir(pathFolderCopyProduk);
                        const pathNamaFileDariIndex = pathNamaFolderProduk + "/" + resultFileFoto[input.dariIndex]; // path foto(sebelum dipindahkan) posisi awal yang akan di ubah
                        const pathNamaFileDariIndexRename = pathFolderCopyProduk + "/" + resultFileFoto[input.keIndex]; // path foto(sesudah dipindahkan) posisi awal yang akan di ubah
                        const pathNamaFileKeIndex = pathNamaFolderProduk + "/" + resultFileFoto[input.keIndex]; // path foto(sebelum dipindahkan) yang akan di ganti dengan posisi awal
                        const pathNamaFileKeIndexRename = pathFolderCopyProduk + "/" + resultFileFoto[input.dariIndex]; // path foto(sesudah dipindahkan) yang akan di ganti dengan posisi awal
                        await fileSystemPromise.rename(pathNamaFileDariIndex, pathNamaFileDariIndexRename); // copy ke folder rename-file
                        await fileSystemPromise.rename(pathNamaFileKeIndex, pathNamaFileKeIndexRename); // copy ke folder rename-file
                        await fileSystemPromise.cp(pathFolderCopyProduk, pathNamaFolderProduk, { recursive: true });
                        await fileSystemPromise.rmdir(pathFolderCopyProduk, { recursive: true });
                        await this.hapusFolderProduk(pathNamaFolderBackupProduk || "default");
                        resolve({
                            status: 200,
                            pesan: "BERHASIL MENGUPDATE POSISI FOTO",
                        });
                    };
                };
            } catch(error) {
                if (callBackErrorCopyFile === true) {
                    await this.hapusFolderProduk(pathNamaFolderProduk || "default");
                    await this.kembalikanFolderProduk(namaFolderProduk || "default");
                    await this.hapusFolderProduk(pathNamaFolderBackupProduk || "default");
                };
                reject(error);
            };
            dbConnection.release();
        });
    };
};

export default new Produk();