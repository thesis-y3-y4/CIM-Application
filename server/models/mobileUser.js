const mongoose = require("mongoose");
const { Schema } = mongoose;

const mobileUserSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  name: {
    type: String,
    required: true,
  },
  studentemail: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  educationLevel: {
    type: String,
    enum: ["Grade School", "High School", "Senior High School", "College"],
    required: true,
  },
  gradeLevel: {
    type: Number,
    default: null,
  },
  highSchoolYearLevel: {
    type: Number,
    default: null,
  },
  shsStrand: {
    type: String,
    default: null,
  },
  seniorHighSchoolYearLevel: {
    type: Number,
    default: null,
  },
  collegeCourse: {
    type: String,
    default: null,
  },
  collegeYearLevel: {
    type: Number,
    default: null,
  },
  subjects: {
    type: [String],
    required: true,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  //points
  clawMarks: { type: Number, default: 0 },
  //Frames that users purchaced ||  inventory
  purchasedShopItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MinigameShopItem",
    },
  ],
  selectedFrame: {
    type: String,
    required: false,
  },
});

mobileUserSchema.virtual("relevantFields").get(function () {
  switch (this.educationLevel) {
    case "Grade School":
      return { gradeLevel: this.gradeLevel };
    case "High School":
      return { highSchoolYearLevel: this.highSchoolYearLevel };
    case "Senior High School":
      return {
        shsStrand: this.shsStrand,
        seniorHighSchoolYearLevel: this.seniorHighSchoolYearLevel,
        strand: this.shsStrand,
      };
    case "College":
      return {
        collegeCourse: this.collegeCourse,
        collegeYearLevel: this.collegeYearLevel,
      };
    default:
      return {};
  }
});

const MobileUser = mongoose.model("MobileUser", mobileUserSchema);

module.exports = MobileUser;
