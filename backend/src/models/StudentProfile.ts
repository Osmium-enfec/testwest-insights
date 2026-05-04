import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    grade: { type: Number, min: 1, max: 12, required: true },
    board: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", default: null },
    section: { type: String, default: "" },
    rollNo: { type: String, default: "" },
    subjects: { type: [String], default: [] },
    subjectChapters: {
      type: [
        {
          subject: { type: String, required: true },
          chapters: { type: [String], default: [] },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
