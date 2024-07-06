import env from "./configs/env";
import express from "express";
import validasiApiKey from "./middlewares/validasiApiKey";
import routerAdmin from "./routes/admin";

env();
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