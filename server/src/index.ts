import env from "./configs/env";
import express from "express";
import validasiApiKey from "./middlewares/validasiApiKey";
import routerAdmin from "./routes/admin";
import database from "./configs/database";

env;
const app = express();

app.use("/api", validasiApiKey, express.json(), routerAdmin);

const { PORT_SERVER } = process.env;
app.listen(PORT_SERVER, (error?: any) => {
    if (error) console.error({
        error,
        pesan: "SERVER ERROR",
        PORT_SERVER,
    });
    else console.log({
        pesan: "SERVER AKTIF",
        PORT_SERVER,
    });
});

database.nonPromise().getConnection((error, dbConnection) => {
    if (error) console.error({
        error,
        pesan: "DATABASE ERROR",
    });
    else {
        console.log({ pesan: "DATABASE AKTIF" });
        dbConnection.release();
    };
});

import produk from "./models/produk";

// const cek = async () => {
//     const ce = await produk.backUpFolderProduk("Test");
//     console.log(ce);
// };

// cek();

// const te = async () => {
//     const re = await produk.kembalikanFolderProduk("Test");
//     console.log(re);
// };

// te();