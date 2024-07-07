import { Respon } from "./AliasInterface";
import jwt from "jsonwebtoken";

type InputLogin = {
    username: string;
    password: string;
    simpanInfoLogin: boolean;
};

class Auth {
    login(input: InputLogin): Promise<Respon> {
        return new Promise((resolve, reject) => {
            try {
                const {
                    ADMIN_USERNAME,
                    ADMIN_PASSWORD,
                    JWT_KEY,
                } = process.env;
                if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) resolve({
                    status: 404,
                    pesan: "AKUN TIDAK DITEMUKAN",
                });
                else {
                    const muatanJwt = {};
                    const jwtKey = JWT_KEY || "default";
                    const waktuBerlakuJwt = input.simpanInfoLogin === true ? { expiresIn: "30d"} : { expiresIn: "1d"};
                    const tokenJwt = jwt.sign(muatanJwt, jwtKey, waktuBerlakuJwt);
                    
                    interface ResponBerhasil extends Respon { token: string };

                    const responBerhasil: ResponBerhasil = {
                        status: 200,
                        pesan: "BERHASIL LOGIN",
                        token: tokenJwt,
                    };
                    resolve(responBerhasil);
                };
            } catch(error) {
                reject(error);
            };
        });
    };
};

export default new Auth();