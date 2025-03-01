import { adminPoll } from "./pool.config.js";
const { POSTGRES_URL, NODE_ENV } = process.env;
export const createDatabaseIfNotExists = async () => {
    const client = await adminPoll.connect();
    if (!POSTGRES_URL) {
        throw new Error("DATABASE_URL could not be found");
    }
    let databaseName = new URL(POSTGRES_URL).pathname.split("/")[1];
    if (NODE_ENV === "test") {
        databaseName = "pikoria_test";
    }
    const response = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [databaseName]);
    if (response.rowCount === 0) {
        await client.query(`CREATE DATABASE ${databaseName}`);
    }
    else {
        console.log(`Database ${databaseName} already exists`);
    }
    try {
    }
    catch (error) {
        if (error instanceof Error && "code" in error) {
            const pgError = error;
            if (pgError.code === "42P04") {
                return console.log(`Database ${databaseName} already exists`);
            }
        }
        if (error instanceof Error) {
            throw error;
        }
        else {
            throw new Error("Error creating database if not exists");
        }
    }
    finally {
        client.release();
    }
};
