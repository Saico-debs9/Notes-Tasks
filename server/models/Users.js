module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  }
  }, {
    timestamps: true,
  });

  return Users;
};
