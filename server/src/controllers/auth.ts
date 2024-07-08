import { Request, Response } from "express";
import model from "../models/auth";

class Auth {
    async login(request: Request, response: Response) {
        try {
            const inputBody = request.body;
            if (
                typeof inputBody.username !== "string"
                || typeof inputBody.password !== "string"
                || typeof inputBody.simpanInfoLogin !== "boolean"
            ) response.send(400);
            else {
                const resultModel = await model.login(inputBody);
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

export default new Auth();
