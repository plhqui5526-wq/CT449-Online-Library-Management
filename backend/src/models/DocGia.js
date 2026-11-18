import mongoose from "mongoose";
import { Schema } from "mongoose";

const DocGiaSchema = new Schema({
  hoLot: { type: String, required: true },
  ten: { type: String, required: true },
  ngaySinh: Date,
  phai: String,
  diaChi: String,
  dienThoai: { type: String, required: true, unique: true },
});

export default mongoose.model("DocGia", DocGiaSchema);
