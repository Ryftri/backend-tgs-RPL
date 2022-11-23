import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";
import Products from "./ProductModel.js";
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890', 9);
const { DataTypes } = Sequelize;

const IncomingGoods = db.define("incoming_goods", {
  uuid:{
    type: DataTypes.STRING,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    validate:{
        notEmpty: true
    }
  },
  kode_brg_masuk:{
    type: DataTypes.STRING,
    defaultValue: `BMS${nanoid()}`,
    allowNull: false,
    validate:{
        notEmpty: true
    }
  },
  quantity:{
      type: DataTypes.INTEGER,
      allowNull: false,
      validate:{
          notEmpty: true
      }
  },
  userId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      validate:{
          notEmpty: true
      }
  },
  productId:{
      type: DataTypes.INTEGER,
      allowNull: false,
      validate:{
          notEmpty: true
      }
  }
});

Users.hasMany(IncomingGoods);
IncomingGoods.belongsTo(Users, { foreignKey: "userId" });

Products.hasMany(IncomingGoods);
IncomingGoods.belongsTo(Products, { foreignKey: "productId" });

export default IncomingGoods;
