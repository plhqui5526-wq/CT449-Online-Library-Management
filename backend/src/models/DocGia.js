import mongoose from "mongoose";
import { Schema } from "mongoose";

const DocGiaSchema = new Schema({
  hoLot: { type: String, required: true },
  ten: { type: String, required: true },
  ngaySinh: { type: Date, required: true },
  phai: String,
  diaChi: { type: String, required: true },
  dienThoai: { type: String, required: true, unique: true },
  tenDangNhap: { type: String, trim: true, lowercase: true },
  matKhauBam: { type: String, select: false },
  hoatDong: { type: Boolean, default: true },
  soSachDangMuon: { type: Number, default: 0, min: 0 },
});

DocGiaSchema.index({ TenDangNhap: 1 }, { unique: true, sparse: true });

export default mongoose.model("DocGia", DocGiaSchema);
