import dotenv from "dotenv";

const env = () => {
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
};

export default env;