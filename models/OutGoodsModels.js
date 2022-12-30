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
  kode_brg_keluar:{
    type: DataTypes.STRING,
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
  alamat:{
      type: DataTypes.STRING,
      allowNull: false,
      validate:{
          notEmpty: true,
          len: [3, 150]
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
