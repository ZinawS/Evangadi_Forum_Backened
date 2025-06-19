// QuestionTag.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const QuestionTag = sequelize.define(
  "QuestionTag",
  {
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "questionTable",
        key: "id",
      },
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tagTable",
        key: "id",
      },
    },
  },
  {
    tableName: "QuestionTag",
    timestamps: false, // Explicitly disable timestamps
  }
);

export default QuestionTag;
