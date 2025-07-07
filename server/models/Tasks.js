module.exports = (sequelize, DataTypes) => {
  const Tasks = sequelize.define('Tasks', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  return Tasks;
};
