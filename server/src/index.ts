import env from "./configs/env";
import express from "express";
import validasiApiKey from "./middlewares/validasiApiKey";
import routerAdmin from "./routes/admin";
import database from "./configs/database";
import routerClient from "./routes/client";

env;
const app = express();

app.use("/api", validasiApiKey, express.json(), routerAdmin, routerClient);

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