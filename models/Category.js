/**
 * Sequelize model for Category
 * Stores predefined categories for questions
 */
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

/**
 * Category model definition
 */
const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "categoryTable",
    timestamps: false,
  }
);

export default Category;
