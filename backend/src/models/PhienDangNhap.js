import mongoose from "mongoose";
import { Schema } from "mongoose";

const PhienDangNhapSchema = new Schema({
    TokenBam: { type: String, required: true, unique: true },
    LoaiTaiKhoan: { type: String, enum: ["docgia", "nhanvien"], required: true },
    MaChuThe: { type: String, required: true },
    HanHet: { type: Date, required: true },
});

export default mongoose.model("PhienDangNhap", PhienDangNhapSchema);