import mongoose from "mongoose";
import { Schema } from "mongoose";

const NhaXuatBanSchema = new Schema({
    tenNXB: { type: String, required: true },
    diaChi: String,
});

export default mongoose.model("NhaXuatBan", NhaXuatBanSchema);