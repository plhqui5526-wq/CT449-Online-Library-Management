import mongoose from "mongoose";
import DocGia from "../models/DocGia.js";
import YeuCauMuon from "../models/YeuCauMuon.js";
import TheoDoiMuonSach from "../models/TheoDoiMuonSach.js";

async function activity(readerId) {
  const filter = {};
  if (readerId) filter.maDocGia = readerId;

  const requestDocuments = await YeuCauMuon.find(filter).sort({ NgayGui: -1 });
  const loanDocuments = await TheoDoiMuonSach.find(filter).sort({
    ngayMuon: -1,
  });

  const requests = [];
  const loans = [];

  for (const request of requestDocuments) {
    requests.push(await activityRow(request));
  }

  for (const loan of loanDocuments) {
    loans.push(await activityRow(loan));
  }

  return { requests, loans };
}

async function activityRow(document) {
  const row = document.toObject();
  row.DocGia = await DocGia.findById(row.maDocGia).select("HoLot Ten");
  const book = await Sach.findById(row.maSach).select(
    "TenSach NguonGoc/TacGia SoQuyen",
  );
  row.Sach = null;

  if (book) {
    row.Sach = book.toObject();
    const borrowed = await TheoDoiMuonSach.countDocuments({
      maSach: row.maSach,
      ngayTra: null,
    });
    row.Sach.SoQuyenCon = book.SoQuyen - borrowed;
  }

  return row;
}

async function checkReader(maDocGia) {
  const reader = await DocGia.findOne({ _id: maDocGia, HoatDong: true });
  if (!reader) throw new ApiError(404, "Không tìm thấy độc giả đang sử dụng.");

  const borrowed = await TheoDoiMuonSach.countDocuments({
    maDocGia,
    ngayTra: null,
  });
  if (borrowed >= 3) throw new ApiError(409, "Bạn đã mượn đủ 3 quyển.");

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

async function createRequest(maDocGia, maSach) {
  if (typeof maSach !== "string" || !maSach.trim())
    throw new ApiError(400, "Vui lòng chọn sách.");

  await checkReader(maDocGia);

  const book = await Sach.findOne({ _id: maSach, DangHienThi: true });
  if (!book) throw new ApiError(404, "Không tìm thấy sách đang cho mượn.");

  const borrowed = await TheoDoiMuonSach.countDocuments({
    maSach,
    ngayTra: null,
  });
  if (borrowed >= book.SoQuyen) throw new ApiError(409, "Sách đã hết trên kệ.");

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

async function cancel(_id, maDocGia) {
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

async function reject(_id, maNhanVienXuLy, LyDoTuChoi) {
  if (typeof LyDoTuChoi !== "string" || !LyDoTuChoi.trim()) {
    throw new ApiError(400, "Vui lòng nhập lý do từ chối.");
  }

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

async function handoff(_id, maNhanVienXuLy) {
  const request = await YeuCauMuon.findById(_id);
  if (!request) throw new ApiError(404, "Không tìm thấy yêu cầu.");

  if (request.TrangThai === "DA_THUC_HIEN")
    return { _id: request.luotMuon, repeated: true };
  if (request.TrangThai !== "CHO_XU_LY")
    throw new ApiError(409, "Yêu cầu không còn chờ giao sách.");

  const { maDocGia, maSach } = request;

  await checkReader(maDocGia);

  const book = await Sach.findOne({ _id: maSach, DangHienThi: true });
  if (!book) throw new ApiError(404, "Không tìm thấy sách đang cho mượn.");

  const borrowed = await TheoDoiMuonSach.countDocuments({
    maSach,
    ngayTra: null,
  });
  if (borrowed >= book.SoQuyen) throw new ApiError(409, "Sách đã hết trên kệ.");

  const now = new Date();
  const loan = await TheoDoiMuonSach.create({
    maDocGia,
    maSach,
    ngayMuon: now,
    ngayHenTra: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    maNhanVienGiao: maNhanVienXuLy,
  });

  await request.updateOne({
    TrangThai: "DA_THUC_HIEN",
    luotMuon: loan._id,
    NgayXuLy: now,
    maNhanVienXuLy,
  });

  return { _id: loan._id, repeated: false };
}

async function receiveReturn(_id, maNhanVienNhanTra) {
  const loan = await TheoDoiMuonSach.findOneAndUpdate(
    { _id, ngayTra: null },
    { ngayTra: new Date(), maNhanVienNhanTra },
  );
  if (loan) return false;

  if (!(await TheoDoiMuonSach.findById(_id)))
    throw new ApiError(404, "Không tìm thấy lượt mượn.");
  return true;
}

async function ensureNoOpenBorrowing(filter) {
  if (await TheoDoiMuonSach.findOne({ ...filter, ngayTra: null })) {
    throw new ApiError(409, "Còn lượt đang mượn. Hãy nhận trả sách trước.");
  }

  if (await YeuCauMuon.findOne({ ...filter, TrangThai: "CHO_XU_LY" })) {
    throw new ApiError(409, "Còn yêu cầu đang chờ. Hãy xử lý yêu cầu trước.");
  }
}