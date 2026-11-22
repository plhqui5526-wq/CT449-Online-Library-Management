import mongoose from "mongoose";
import { Schema } from "mongoose";

const PhienDangNhapSchema = new Schema({
    tokenBam: { type: String, required: true, unique: true },
    loaiTaiKhoan: { type: String, enum: ["docgia", "nhanvien"], required: true },
    maChuThe: { type: String, required: true },
    hanHet: { type: Date, required: true },
});

export default mongoose.model("PhienDangNhap", PhienDangNhapSchema);