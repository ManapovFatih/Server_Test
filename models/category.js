const sequelize = require('./../db')
const { DataTypes } = require("sequelize");
const Product = require("./product");

const Category = sequelize.define(
  "category",
  {
    apiId: { type: DataTypes.STRING, unique: true },
    parent: { type: DataTypes.STRING },
    title: { type: DataTypes.STRING },
    media: { type: DataTypes.STRING },
    code: { type: DataTypes.STRING },
    priority: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING, defaultValue: "dish" },
    status: { type: DataTypes.INTEGER, defaultValue: 1 },
    options: { type: DataTypes.JSONB },
  },
  {
    timestamps: false,
  }
);

Category.hasMany(Product);
Product.belongsTo(Category);


module.exports = Category;
