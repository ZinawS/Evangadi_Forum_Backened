import sequelize from "../config/database.js";
import User from "./User.js";
import Question from "./Question.js";
import Answer from "./Answer.js";
import Rating from "./Rating.js";
import Tag from "./Tag.js";
import Category from "./Category.js";
import QuestionTag from "./QuestionTag.js";

Question.belongsToMany(Tag, {
  through: QuestionTag,
  foreignKey: "questionId",
  otherKey: "tagId",
});
Tag.belongsToMany(Question, {
  through: QuestionTag,
  foreignKey: "tagId",
  otherKey: "questionId",
});

// Define associations
Question.belongsTo(User, { foreignKey: "userid", targetKey: "userid" });
Question.belongsTo(Category, { foreignKey: "categoryId", targetKey: "id" });

// Updated many-to-many association with explicit join table config
Question.belongsToMany(Tag, {
  through: {
    model: "QuestionTag",
    timestamps: false, // Explicitly disable timestamps
    // Add any other join table specific options here
  },
  foreignKey: "questionId",
  otherKey: "tagId",
});

Tag.belongsToMany(Question, {
  through: {
    model: "QuestionTag",
    timestamps: false, // Explicitly disable timestamps
    // Add any other join table specific options here
  },
  foreignKey: "tagId",
  otherKey: "questionId",
});

// Rest of your existing associations
Answer.belongsTo(User, { foreignKey: "userid", targetKey: "userid" });
Answer.belongsTo(Question, {
  foreignKey: "questionid",
  targetKey: "questionid",
});
Answer.hasMany(Rating, {
  foreignKey: "answerId",
  sourceKey: "answerid",
  as: "Ratings",
});
Rating.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "userid",
  as: "Rater",
});
Rating.belongsTo(Answer, { foreignKey: "answerId", targetKey: "answerid" });

export { User, Question,QuestionTag, Answer, Rating, Tag, Category };

// Sync database (for development only)
if (process.env.NODE_ENV === "development") {
  sequelize
    .sync({ force: false })
    .then(async () => {
      // console.log("Database & tables synced!");
      const categories = [
        "JavaScript",
        "Python",
        "Java",
        "HTML",
        "CSS",
        "SQL",
        "Node.js",
        "React",
        "DevOps",
        "Cybersecurity",
        "Others",
      ];
      await Category.bulkCreate(
        categories.map((name) => ({ name })),
        { ignoreDuplicates: true }
      );
    })
    .catch((error) => {
      console.error("Error syncing database:", error);
    });
}
