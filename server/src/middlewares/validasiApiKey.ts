import { Request, Response, NextFunction } from "express";

const validasiApiKey = (request: Request, response: Response, next: NextFunction) => {
    try {
        const { API_KEY } = process.env;
        const kataKunciApiKey = "x-api-key";
        const inputApiKey = request.headers[kataKunciApiKey];
        if (inputApiKey !== API_KEY) response.send(403);
        else next();
    } catch(error) {
        console.error({
            error,
            pesan: "VALIDASI API KEY ERROR",
        });
    };
};

export default validasiApiKey;