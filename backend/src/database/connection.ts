import { Sequelize } from 'sequelize';
import { config } from '../config.js';

const rawUrl = config.databaseUrl || "postgres://coreshell:coreshell_secure_pass_2026@localhost:5432/coreshell";
const requiresSsl = rawUrl.includes('sslmode=require') || process.env.DB_SSL === 'true';

let dbUrl = rawUrl;
if (dbUrl.includes('?')) {
    dbUrl = dbUrl.split('?')[0] as string;
}

export const sequelize = new Sequelize(dbUrl, {
    dialectOptions: requiresSsl ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } : {},
    logging: false
});

export const connectToDatabase = async () =>{

    try {
        await sequelize.authenticate()
        console.log('Connected to database')
        
        // Sync models with the database safely (without altering to prevent cache bugs)
        await sequelize.sync();
        console.log('Database synchronized');

    } catch (err) {
        console.error('Failed to connect to the database:', err)
        return process.exit(1)
    }
};
// export const config = {
//     port: Number(process.env.PORT) || 3000,
//     jwtSecret: process.env.JWT_SECRET || "",
//     databaseUrl: process.env.DATABASE_URL || "",
//     redisUrl: process.env.REDIS_URL || "",
// };
