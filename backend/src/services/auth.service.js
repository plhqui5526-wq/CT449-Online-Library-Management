import bcrypt from "bcrypt"; 
import mongoose from "mongoose";
import NhanVien from "../models/NhanVien";
import PhienDangNhap from "../models/PhienDangNhap";
import DocGia from "../models/DocGia";
import { ApiError } from "../utils/api-error";

export async function registerReader(body = {}) {
    const { username, password, HoLot, Ten, NgaySinh, Phai, DiaChi, SoDienThoai } = body;
    if(!username || !password) throw new ApiError(400, "Vui lòng nhập tên đăng nhập và mật khẩu.");

    const MatKhauBam = await bcrypt.hash(password, 12);
}