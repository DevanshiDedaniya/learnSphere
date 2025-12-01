import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: String,
  duration: Number, // seconds
  description: String,
  //resources: [resourceSchema]
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  skills_gain: { type: [String], default: [] },
  modules: { type: [moduleSchema], default: [] },
  courseDuration: {
    type: Number,
    required: true,
    default: 90
  },
  category: String,
  level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  price: { type: Number, default: 0 },
  tags: { type: [String], default: [] },

  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  ratedBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 }
    }
  ],

  totalStudents: { type: Number, default: 0 },
  thumbnail: String,

  //subtitle: String,
  //previewVideo: String,
  //prerequisites: [String],
  //faqs: [faqSchema],
  //status: { type: String, enum: ["draft","published","archived"], default: "draft" }
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
