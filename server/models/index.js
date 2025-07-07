const Sequelize = require('sequelize');
const sequelize = require('../config/config');

const UserModel = require('./Users');
const NotesModel = require('./Notes');
const TasksModel = require('./Tasks')

const Users = UserModel(sequelize, Sequelize.DataTypes);
const Notes = NotesModel(sequelize, Sequelize.DataTypes);
const Tasks = TasksModel(sequelize, Sequelize.DataTypes);


Users.hasMany(Notes);
Notes.belongsTo(Users);

Users.hasMany(Tasks);
Tasks.belongsTo(Users);


module.exports = {sequelize, Users, Notes, Tasks};
