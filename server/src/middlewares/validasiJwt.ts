import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const validasiJwt = (request: Request, response: Response, next: NextFunction) => {
    try {
        const inputTokenJwt = request.headers.authorization || "default";
        const jwtKey = process.env.JWT_KEY || "default";
        jwt.verify(inputTokenJwt, jwtKey, (penolakanJwt) => {
            if (penolakanJwt) response.send(403);
            else next();
        });
    } catch(error) {
        console.error({
            error,
            pesan: "VALIDASI JWT ERROR",
        });
        response.send(500);
    };
};

export default validasiJwt;