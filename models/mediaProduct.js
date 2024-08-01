const sequelize = require('./../db')
const { DataTypes } = require("sequelize");

const MediaProduct = sequelize.define("mediaProduct", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  media: { type: DataTypes.STRING(100) },
  poster: { type: DataTypes.STRING(100) }, // Картинка обложки для видео
  options: {
    type: DataTypes.JSONB,
    defaultValue: {
      type: "image", // image, video
      width: 0,
      height: 0,
      size: 0, // Размер файла в КБ
    },
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = MediaProduct;
