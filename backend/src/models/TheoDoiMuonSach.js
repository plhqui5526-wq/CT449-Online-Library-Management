import mongoose from "mongoose";
import { Schema } from "mongoose";

const TheoDoiMuonSachSchema = new Schema({
    maDocGia: { type: Schema.Types.ObjectId, ref: "DocGia", required: true },
    maSach: { type: Schema.Types.ObjectId, ref: "Sach", required: true },
    ngayMuon: { type: Date, required: true, default: Date.now },
    ngayHenTra: { type: Date, default: null },
    ngayTra: { type: Date, default: null },
    maNhanVienGiao: { type: Schema.Types.ObjectId, ref: "NhanVien" },
    maNhanVienNhanTra: { type: Schema.Types.ObjectId, ref: "NhanVien" },
});

// Chỉ một lượt đang mở cho cặp độc giả và sách. Lượt đã trả vẫn nằm trong lịch sử.
TheoDoiMuonSachSchema.index(
  { maDocGia: 1, maSach: 1 },
  { unique: true, partialFilterExpression: { ngayTra: null } },
);

export default mongoose.model("TheoDoiMuonSach", TheoDoiMuonSachSchema);