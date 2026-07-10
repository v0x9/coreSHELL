// Empty file for user implementation
import { DataTypes , Model } from "sequelize";

import {sequelize , connectToDatabase} from "../database/connection.js" 


import { SessionStatus } from "../types/session.js"


class Session extends Model {
    declare id: string;
    declare userId: string;
    declare containerId: string;
    declare status: SessionStatus;
    declare lastActivity: Date;
    declare endedAt: Date | null;
}

Session.init({
    id : {
        type : DataTypes.UUID ,
        defaultValue : DataTypes.UUIDV4,
        primaryKey : true,
    },
    userId : {
        type : DataTypes.UUID ,
        allowNull : false ,
    },
    containerId : {
        type : DataTypes.STRING ,
        allowNull : false ,
        unique : true ,
    },
    status : {
        type : DataTypes.ENUM(...Object.values(SessionStatus)) ,
        allowNull : false ,
        defaultValue : SessionStatus.RUNNING , 
    },
    lastActivity : {
        type : DataTypes.DATE ,
        allowNull : false ,
        defaultValue : DataTypes.NOW , 
    },
    endedAt : {
        type : DataTypes.DATE ,
        allowNull : true ,
    },
}, {
    sequelize , 
    modelName : "Session" , 
    tableName : "sessions" , 
    timestamps : true , 
});

export default Session;
