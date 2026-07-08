// Empty file for user implementation
//defining relationships between models
import User from "./User.js";
import Session from "./Session.js";

User.hasMany(Session, { foreignKey: "userId" , 
onDelete : "CASCADE" });

Session.belongsTo(User, { foreignKey: "userId" });

export { User, Session };