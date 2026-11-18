import mongoose from "mongoose";
import { Schema } from "mongoose";

const NhanVienSchema = new Schema({
    hoTenNV: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    chucVu: String,
    diaChi: String,
    soDienThoai: String,
});

export default mongoose.model("NhanVien", NhanVienSchema);