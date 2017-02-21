const mongoose = require("mongoose");
const Schema   = mongoose.Schema;
const Event     = require("./event");

const photoSchema = new Schema({
  _eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  name: {
    type: String,
    required: [true, 'Name Required']
  },
  description: {
    type: String,
  },
  url_path: {
    type: String,
    required: [true, 'Photo Upload Required']
  },
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

const Photo = mongoose.model("Photo", photoSchema);
module.exports = Photo;
