import mongoose, { Schema } from "mongoose";

const YeuCauMuonSchema = new Schema({
  maDocGia: { type: Schema.Types.ObjectId, ref: "DocGia", required: true },
  maSach: { type: Schema.Types.ObjectId, ref: "Sach", required: true },
  trangThai: {
    type: String,
    enum: ["CHO_XU_LY", "DA_THUC_HIEN", "DA_HUY", "TU_CHOI"],
    default: "CHO_XU_LY",
  },
  ngayGui: { type: Date, default: Date.now },
  ngayXuLy: Date,
  maNhanVienXuLy: {
    type: Schema.Types.ObjectId,
    ref: "NhanVien",
    select: false,
  },
  lyDoTuChoi: String,
  luotMuon: { type: Schema.Types.ObjectId, ref: "TheoDoiMuonSach" },
});

YeuCauMuonSchema.index(
  { maDocGia: 1, maSach: 1 },
  {
    unique: true,
    partialFilterExpression: {
      TrangThai: "CHO_XU_LY",
      maDocGia: { $type: "objectId" },
      maSach: { $type: "objectId" },
    },
  },
);

export default mongoose.model("YeuCauMuon", YeuCauMuonSchema, "YeuCauMuon");