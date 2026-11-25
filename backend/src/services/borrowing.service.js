import mongoose from "mongoose";
import DocGia from "../models/DocGia.js";
import YeuCauMuon from "../models/YeuCauMuon.js";
import TheoDoiMuonSach from "../models/TheoDoiMuonSach.js";

export async function activity(readerId) {
  const filter = readerId ? { maDocGia: readerId } : {};
  const requests = await YeuCauMuon.find(filter).sort({ NgayGui: -1 }).lean();
  const loans = await TheoDoiMuonSach.find(filter)
    .sort({ ngayMuon: -1 })
    .lean();

  for (const request of requests) {
    request.DocGia = await DocGia.findById(request.maDocGia)
      .select("hoLot ten")
      .lean();
    request.Sach = await Sach.findById(request.maSach)
      .select("tenSach nguonGoc/tacGia soQuyen soQuyenCon")
      .lean();
  }

  for (const loan of loans) {
    loan.DocGia = await DocGia.findById(loan.maDocGia)
      .select("hoLot ten")
      .lean();
    loan.Sach = await Sach.findById(loan.maSach)
      .select("tenSach nguonGoc/tacGia soQuyen soQuyenCon")
      .lean();
  }

  return { requests, loans };
}

async function checkReader(maDocGia) {
  const reader = await DocGia.findOne({ _id: maDocGia, HoatDong: true });
  if (!reader) throw new ApiError(404, "Không tìm thấy độc giả đang sử dụng.");
  if (reader.SoSachDangMuon >= 3)
    throw new ApiError(409, "Bạn đã mượn đủ 3 quyển.");
  if (
    await TheoDoiMuonSach.findOne({
      maDocGia,
      ngayTra: null,
      ngayHenTra: { $lt: new Date() },
    })
  ) {
    throw new ApiError(409, "Hãy trả sách quá hạn trước khi mượn thêm.");
  }
}

export async function createRequest(maDocGia, maSach) {
  if (!maSach) throw new ApiError(400, "Vui lòng chọn sách.");
  await checkReader(maDocGia);
  const book = await Sach.findOne({ _id: maSach, DangHienThi: true });
  if (!book) throw new ApiError(404, "Không tìm thấy sách đang cho mượn.");
  if (!book.SoQuyenCon) throw new ApiError(409, "Sách đã hết trên kệ.");
  if (await TheoDoiMuonSach.findOne({ maDocGia, maSach, ngayTra: null })) {
    throw new ApiError(409, "Bạn đang mượn đầu sách này.");
  }
  const filter = { maDocGia, maSach, TrangThai: "CHO_XU_LY" };
  const existing = await YeuCauMuon.findOne(filter);
  if (existing) return { request: existing, repeated: true };
  try {
    const request = await YeuCauMuon.create(filter);
    return { request, repeated: false };
  } catch (error) {
    if (error.code !== 11000) throw error;
    const request = await YeuCauMuon.findOne(filter);
    if (!request) throw error;
    return { request, repeated: true };
  }
}

export async function cancel(_id, maDocGia) {
  const filter = { _id, maDocGia };
  const request = await YeuCauMuon.findOneAndUpdate(
    { ...filter, TrangThai: "CHO_XU_LY" },
    { TrangThai: "DA_HUY", NgayXuLy: new Date() },
  );
  if (request) return;
  const existing = await YeuCauMuon.findOne(filter);
  if (!existing) throw new ApiError(404, "Không tìm thấy yêu cầu.");
  if (existing.TrangThai !== "DA_HUY")
    throw new ApiError(409, "Yêu cầu đã được xử lý.");
}

export async function reject(_id, maNhanVienXuLy, LyDoTuChoi) {
  if (!LyDoTuChoi) throw new ApiError(400, "Vui lòng nhập lý do từ chối.");
  const request = await YeuCauMuon.findOneAndUpdate(
    { _id, TrangThai: "CHO_XU_LY" },
    { TrangThai: "TU_CHOI", NgayXuLy: new Date(), maNhanVienXuLy, LyDoTuChoi },
  );
  if (request) return;
  const existing = await YeuCauMuon.findById(_id);
  if (!existing) throw new ApiError(404, "Không tìm thấy yêu cầu.");
  if (existing.TrangThai !== "TU_CHOI")
    throw new ApiError(409, "Yêu cầu đã được xử lý.");
}

export async function handoff(_id, maNhanVienXuLy) {
  const request = await YeuCauMuon.findById(_id);
  if (!request) throw new ApiError(404, "Không tìm thấy yêu cầu.");
  if (request.TrangThai === "DA_THUC_HIEN") return { _id: request.luotMuon, repeated: true };
  if (request.TrangThai !== "CHO_XU_LY") throw new ApiError(409, "Yêu cầu không còn chờ giao sách.");

  const { maDocGia, maSach } = request;
  await checkReader(maDocGia);
  const book = await Sach.findOne({ _id: maSach, DangHienThi: true });
  if (!book) throw new ApiError(404, "Không tìm thấy sách đang cho mượn.");
  const borrowed = await TheoDoiMuonSach.countDocuments({ maSach, ngayTra: null });
  if (borrowed >= book.SoQuyen) throw new ApiError(409, "Sách đã hết trên kệ.");

  const now = new Date();
  const loan = await TheoDoiMuonSach.create({
    maDocGia, maSach, ngayMuon: now, ngayHenTra: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    maNhanVienGiao: maNhanVienXuLy,
  });
  await request.updateOne({ trangThai: "DA_THUC_HIEN", luotMuon: loan._id, ngayXuLy: now, maNhanVienXuLy });
  return { _id: loan._id, repeated: false };
}

export async function receiveReturn(_id, maNhanVienNhanTra) {
  const loan = await TheoDoiMuonSach.findOneAndUpdate(
    { _id, ngayTra: null },
    { ngayTra: new Date(), maNhanVienNhanTra },
  );
  if (loan) return false;
  if (!(await TheoDoiMuonSach.findById(_id)))
    throw new ApiError(404, "Không tìm thấy lượt mượn.");
  return true;
}

export async function ensureNoOpenBorrowing(filter) {
  if (await TheoDoiMuonSach.findOne({ ...filter, ngayTra: null })) {
    throw new ApiError(409, "Còn lượt đang mượn. Hãy nhận trả sách trước.");
  }
  if (await YeuCauMuon.findOne({ ...filter, TrangThai: "CHO_XU_LY" })) {
    throw new ApiError(409, "Còn yêu cầu đang chờ. Hãy xử lý yêu cầu trước.");
  }
}