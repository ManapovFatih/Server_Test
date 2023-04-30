const sequelize = require('../db.js')
const {DataTypes} = require('sequelize')


const State = sequelize.define('state', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
    text: {type: DataTypes.STRING, allowNull: false},
    file: {type: DataTypes.STRING,},
},
// Опции
{
  timestamps: false
})

module.exports = State