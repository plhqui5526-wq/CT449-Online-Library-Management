import mongoose from "mongoose";
import { Schema } from "mongoose";

const DocGiaSchema = new Schema({
  HoLot: { type: String, required: true },
  Ten: { type: String, required: true },
  NgaySinh: { type: Date, required: true },
  Phai: String,
  DiaChi: { type: String, required: true },
  DienThoai: { type: String, required: true, unique: true },
  TenDangNhap: { type: String, trim: true, lowercase: true },
  MatKhauBam: { type: String, select: false },
  HoatDong: { type: Boolean, default: true },
  SoSachDangMuon: { type: Number, default: 0, min: 0 },
});

DocGiaSchema.index({ TenDangNhap: 1 }, { unique: true, sparse: true });

export default mongoose.model("DocGia", DocGiaSchema);
