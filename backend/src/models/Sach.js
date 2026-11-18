import mongoose from "mongoose";
import { Schema } from "mongoose";

const SachSchema = new Schema({
    tenSach: {type: String, required: true},
    donGia: {type: Number, required: true, min: 0},
    soQuyen: {type: Number, required: true, min: 0},
    namXuatBan: Number,
    maNXB: {type: Schema.Types.ObjectId, ref: "NhaXuatBan", required: true},
    "nguonGoc/tacGia": String,
    moTa: {type: String, default: ""},
});

export default mongoose.model("Sach", SachSchema);