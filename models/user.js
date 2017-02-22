const mongoose = require("mongoose");
const Schema   = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username Required']
  },
  email: {
    type: String,
    required: [true, 'Email Required']
  },
  password: {
    type: String,
    required: [true, 'Password Required']
  },
  picture: {
    pic_path: String,
  },
  userEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
