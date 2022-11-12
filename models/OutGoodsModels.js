import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";
import Products from "./ProductModel.js";

const { DataTypes } = Sequelize;

const OutGoods = db.define("out_goods", {
  uuid:{
    type: DataTypes.STRING,
    defaultValue: DataTypes.UUIDV4,
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

Users.hasMany(OutGoods);
OutGoods.belongsTo(Users, { foreignKey: "userId" });

Products.hasMany(OutGoods);
OutGoods.belongsTo(Products, { foreignKey: "productId" });

export default OutGoods;
