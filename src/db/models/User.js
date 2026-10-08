import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    messages: { type: [messageSchema], default: [] }
  },
  {
    timestamps: true,
    optimisticConcurrency: true
  }
);

function removeSensitive(ret) {
  delete ret.password;
  return ret;
}

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    return removeSensitive(ret);
  }
});

userSchema.set("toObject", {
  transform: function (doc, ret) {
    return removeSensitive(ret);
  }
});

const User = mongoose.model("User", userSchema);

export default User;
