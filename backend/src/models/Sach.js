import mongoose from "mongoose";
import { Schema } from "mongoose";

const SachSchema = new Schema({
  TenSach: { type: String, required: true },
  DonGia: { type: Number, required: true, min: 0 },
  SoQuyen: { type: Number, required: true, min: 0 },
  NamXuatBan: Number,
  maNXB: { type: Schema.Types.ObjectId, ref: "NhaXuatBan", required: true },
  "NguonGoc/TacGia": String,
  MoTa: { type: String, default: "" },
  ChuDe: String,
  NhanKe: [String],
  ViTriKe: String,
  LoiGioiThieu: String,
  NhanManh: { type: Boolean, default: false },
  DangHienThi: { type: Boolean, default: true },
  ISBN: String,
  
});

export default mongoose.model("Sach", SachSchema);