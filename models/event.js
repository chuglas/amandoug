const mongoose = require("mongoose");
const Schema   = mongoose.Schema;
const User          = require("./user");

const eventSchema = new Schema({
  user: { type: Number, ref: 'User' },
  name: {
    type: String,
    required: [true, 'Name Required']
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: [true, 'Date Required']
  },
  eventPhotos: [{ type: Schema.Types.ObjectId, ref: 'Photo' }]
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
