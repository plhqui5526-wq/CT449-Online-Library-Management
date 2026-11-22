import mongoose from "mongoose";
import { Schema } from "mongoose";

const NhanVienSchema = new Schema({
    hoTenNV: { type: String, required: true },
    usernameNV: { type: String, trim: true, lowercase: true },
    passwordNV: { type: String, required: true, select: false },
    chucVu: String,
    diaChi: String,
    soDienThoai: String,
});

export default mongoose.model("NhanVien", NhanVienSchema);