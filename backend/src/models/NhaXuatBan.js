import mongoose from "mongoose";
import { Schema } from "mongoose";

const NhaXuatBanSchema = new Schema({
    TenNXB: { type: String, required: true },
    DiaChi: String,
    NgungSuDung: { type: Boolean, default: false },
});

export default mongoose.model("NhaXuatBan", NhaXuatBanSchema);