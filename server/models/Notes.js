module.exports = (sequelize, DataTypes) => {
    const Notes = sequelize.define('Notes', {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    }, {
      timestamps: true,
    });
  
    return Notes;
  };
  