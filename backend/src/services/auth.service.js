import bcrypt from "bcrypt"; 
import mongoose from "mongoose";
import NhanVien from "../models/NhanVien";
import PhienDangNhap from "../models/PhienDangNhap";
import DocGia from "../models/DocGia";
import { ApiError } from "../utils/api-error";

export async function registerReader(body = {}) {
    const { username, password, hoLot, ten, ngaySinh, phai, diaChi, dienThoai } = body;
    if(!username || !password) throw new ApiError(400, "Vui lòng nhập tên đăng nhập và mật khẩu.");
    if(!hoLot || !ten) throw new ApiError(400, "Vui lòng nhập tên");
    if(!ngaySinh) throw new ApiError(400, "Vui lòng nhập ngày sinh");
    if(!diaChi) throw new ApiError(400, "Vui lòng nhập địa chỉ");
    if(!dienThoai) throw new ApiError(400, "Vui lòng nhập số điện thoại");
    const MatKhauBam = await bcrypt.hash(password, 12);
    const reader = await DocGia.create({
        hoLot, ten, ngaySinh, phai, diaChi, dienThoai, tenDangNhap: username, matKhauBam,
    });
    return { role: "docGia", code: reader._id, name: reader.hoLot + " " + reader.ten };
}

export async function authenticate({ username, password, role } = {}) {
    if (!username || !password)
      throw new ApiError(400, "Vui lòng nhập tên đăng nhập và mật khẩu.");
    const invalid = "Tên đăng nhập hoặc mật khẩu chưa đúng.";
    if(role === "nhanVien") {
        const employee = await NhanVien.findOne({ usernameNV: username.trim().toUpperCase() }).select("+passwordNV");
        if(!employee || !(await bcrypt.compare(password, employee.passwordNV))) throw new ApiError(401, invalid);
        return { role, code: employee._id, name: employee.hoTenNV };
    }

    if(role !== "docGia") throw new ApiError(400, "Vui lòng chọn loại tài khoản");
    const reader = await DocGia.findOne({ tenDangNhap: username, hoatDong: true }).select("+matKhauBam");
    if(!reader || !(await bcrypt.compare(password, reader.matKhauBam))) throw new ApiError(401, invalid);
    return { role: "docGia", code: reader._id, name: reader.hoLot + " " + reader.ten };
}

export const sessionDuration = 8 * 60 * 60 * 1000;
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

export async function createSession(user) {
    const token = randomBytes(32).toString("base64url");
    await PhienDangNhap.create({
        tokenBam: hashToken(token), 
        loaiTaiKhoan: user.role, 
        maChuThe: user.code,
        hanHet: new Date(Date.now() + sessionDuration),
    });

    return token;
}

export async function revokeSession(token) {
    if(token) await PhienDangNhap.deleteOne({ tokenBam: hashToken(token) });
}

export async function findSessionUser(token) {
    if(!token) return null;
    const session = await PhienDangNhap.findOne({ tokenBam: hashToken(token), hanHet: { $gt: new Date() } });
    if(!session) return null;
    if(session.loaiTaiKhoan = "nhanVien") {
        const employee = await NhanVien.findOne({ _id: session.maChuThe });
        return employee ? { role: "nhanVien", code: employee._id, name: employee.hoTenNV } : null;
    }
    const reader = await DocGia.findOne({ _id: session.maChuThe, hoatDong: true });
    return reader ? { role: "docGia", code: reader._id, name: reader.hoLot + " " + reader.ten } : null;
}