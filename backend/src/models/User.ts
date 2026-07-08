// Empty file for user implementation
import { DataTypes , Model } from "sequelize";

import {sequelize , connectToDatabase} from "../database/connection.js"


class User extends Model {}

User.init({
    id : {
        type : DataTypes.UUID ,
        defaultValue : DataTypes.UUIDV4, 
        primaryKey : true, 
    } , 
    username : {
        type : DataTypes.STRING , 
        allowNull : false ,
        unique : true , 
    }, 
    email : {
        type : DataTypes.STRING ,
        allowNull : false ,
        unique : true, 
    }, 
    passwordHash : {
        type : DataTypes.STRING ,
        allowNull : false, 
    },
}, {
    sequelize , 
    modelName : "User", 
    tableName : "users" , 
    timestamps : true, 
});

export default User;