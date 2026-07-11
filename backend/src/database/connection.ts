import { Sequelize } from 'sequelize';
import { config } from '../config.js';

// Strip out sslmode from Aiven URL if present so our dialectOptions apply safely
let dbUrl = config.databaseUrl;
if (dbUrl.includes('?')) {
    dbUrl = dbUrl.split('?')[0] as string;
}

export const sequelize = new Sequelize(dbUrl , {
    dialectOptions : {
        ssl : {
            require : true, 
            rejectUnauthorized : false
        }
    },
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
