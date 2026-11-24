import mongoose from "mongoose";
import DocGia from "../models/DocGia.js";

export async function activity(readerId) {
    const filter = readerId ? { maDocGia: readerId } : {};
    const requests = await YeuCauMuon.find(filter).sort({ NgayGui: -1 }).lean();
    const loans = await TheoDoiMuonSach.find(filter).sort({ ngayMuon: -1 }).lean();

    for (const request of requests) {
        request.DocGia = await DocGia.findById(request.maDocGia).select("hoLot ten").lean();
        request.Sach = await Sach.findById(request.maSach).select("tenSach nguonGoc/tacGia soQuyen soQuyenCon").lean();
    }

    for (const loan of loans) {
        loan.DocGia = await DocGia.findById(loan.maDocGia).select("HoLot Ten").lean();
        loan.Sach = await Sach.findById(loan.maSach).select("TenSach NguonGoc/TacGia SoQuyen SoQuyenCon").lean();
    }

    return { requests, loans };
}