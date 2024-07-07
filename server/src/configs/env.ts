import dotenv from "dotenv";

class Env {
    value: any;

    constructor() {
        try {
            const { NODE_ENV } = process.env;
            dotenv.config({ path: `./env/.env.${ NODE_ENV }` });
            console.log({
                pesan: "ENV AKTIF",
                mode: NODE_ENV,
            });
        } catch(error) {
            console.error({
                error,
                pesan: "ENV ERROR"
            });
        };

        this.value = process.env;
    };
};

export default new Env();