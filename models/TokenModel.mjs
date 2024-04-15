
import mongoose from 'mongoose';
import Admin from './AdminModel.mjs';
const TokenSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please add id"],
      ref: "Admin",
    },
    token: {
      type: String,
      required: [true, "Please add token"]
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600,// this is the expiry time in seconds
    },
  });
  export default mongoose.model("Token", TokenSchema,"token");