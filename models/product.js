const sequelize = require('./../db')
const { DataTypes, Op } = require("sequelize");
const MediaProduct = require("./mediaProduct");


const Product = sequelize.define(
  "product",
  {
    title: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    price: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    code: { type: DataTypes.STRING },
    recommend: { type: DataTypes.INTEGER, defaultValue: 0 },
    tags: { type: DataTypes.JSONB },
    options: {
      type: DataTypes.JSONB,
      defaultValue: {
        stick: 0,
        apiId: "",
        groupId: "",
        productCategoryId: "",
        parentGroup: "",
        groupModifiers: [],
        unit: "шт",
        priceFrom: false,
      },
    },
    type: { type: DataTypes.STRING, defaultValue: "dish" },
    status: { type: DataTypes.SMALLINT, defaultValue: 1 },
    priority: { type: DataTypes.SMALLINT, defaultValue: 0 },
    energy: {
      type: DataTypes.JSONB,
      defaultValue: {
        protein: 0,
        fat: 0,
        carbohydrate: 0,
        kkal: 0,
        weight: 0,
      },
    },
    popular: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
);

Product.hasMany(MediaProduct, { as: "medias", onDelete: "cascade" });

module.exports = Product;
