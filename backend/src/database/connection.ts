// Empty file for user implementation
const Sequelize = require('sequelize')
const {config} = require('../config.js')


export const sequelize = new Sequelize(config.databaseUrl , {
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
        
        // Sync models with the database
        await sequelize.sync({ alter: true });
        console.log('Database synchronized');

    } catch (err) {
        console.log('failed to connect to the database')
        return process.exit(1)
    }
};
// export const config = {
//     port: Number(process.env.PORT) || 3000,
//     jwtSecret: process.env.JWT_SECRET || "",
//     databaseUrl: process.env.DATABASE_URL || "",
//     redisUrl: process.env.REDIS_URL || "",
// };
