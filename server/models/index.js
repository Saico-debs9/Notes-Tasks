const Sequelize = require('sequelize');
const sequelize = require('../config/config');

const UserModel = require('./Users');
const NotesModel = require('./Notes');
const TasksModel = require('./Tasks');
const SubTasksModel = require('./SubTasks');

const Users = UserModel(sequelize, Sequelize.DataTypes);
const Notes = NotesModel(sequelize, Sequelize.DataTypes);
const Tasks = TasksModel(sequelize, Sequelize.DataTypes);
const SubTasks = SubTasksModel(sequelize, Sequelize.DataTypes);


Users.hasMany(Notes);
Notes.belongsTo(Users);

Users.hasMany(Tasks);
Tasks.belongsTo(Users);

Tasks.hasMany(SubTasks,{foreignKey: 'task_id'});
SubTasks.belongsTo(Tasks,{foreignKey: 'task_id'});


module.exports = {sequelize, Users, Notes, Tasks, SubTasks};
