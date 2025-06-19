/**
 * Sequelize model for Rating
 */
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Rating = sequelize.define(
  "Rating",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    answerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "answerTable",
        key: "answerid",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "userTable",
        key: "userid",
      },
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ratingTable",
    timestamps: false,
  }
);


export default Rating;
