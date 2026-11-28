import bcrypt from "bcrypt"; 
import NhanVien from "../models/NhanVien";
import PhienDangNhap from "../models/PhienDangNhap";
import DocGia from "../models/DocGia";
import { ApiError } from "../utils/api-error";

function checkCredentials(username, password) {
  if (typeof username !== "string" || !username.trim() || typeof password !== "string" || !password.trim()) {
    throw new ApiError(400, "Vui lòng nhập tên đăng nhập và mật khẩu dạng văn bản.");
  }
}

async function registerReader(body = {}) {
  const { username, password } = body;
  checkCredentials(username, password);
  const data = readerData(body, true);
  const MatKhauBam = await bcrypt.hash(password, 12);
  const reader = await DocGia.create({
    ...data,
    TenDangNhap: username,
    MatKhauBam,
  });
  return {
    role: "reader",
    _id: reader._id,
    name: reader.HoLot + " " + reader.Ten,
  };
}

async function authenticate({ username, password, role } = {}) {
  checkCredentials(username, password);
  const invalid = "Tên đăng nhập hoặc mật khẩu chưa đúng.";
  if (role === "staff") {
    const employee = await NhanVien.findOne({ usernameNV: username }).select("+passwordNV");
    if (!employee || !(await bcrypt.compare(password, employee.passwordNV))) throw new ApiError(401, invalid);
    return { role, _id: employee._id, name: employee.hoTenNV };
  }

  if (role !== "reader") throw new ApiError(400, "Vui lòng chọn loại tài khoản.");

  const reader = await DocGia.findOne({ TenDangNhap: username, HoatDong: true }).select("+MatKhauBam");
  if (!reader || !(await bcrypt.compare(password, reader.MatKhauBam))) throw new ApiError(401, invalid);
  return { role, _id: reader._id, name: reader.HoLot + " " + reader.Ten };
}

// Đặt thời lượng 8 giờ, tính bằng mili giây cho cookie.
const sessionDuration = 8 * 60 * 60 * 1000;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function createSession(user) {
  const token = randomBytes(32).toString("base64url");
  await PhienDangNhap.create({
    TokenBam: hashToken(token), 
    LoaiTaiKhoan: user.role, 
    chuThe: user._id,
    HanHet: new Date(Date.now() + sessionDuration),
  });
  return token;
}

export async function revokeSession(token) {
    if(token) await PhienDangNhap.deleteOne({ tokenBam: hashToken(token) });
}

async function findSessionUser(token) {
  if (!token) return null;

  const session = await PhienDangNhap.findOne({ TokenBam: hashToken(token), HanHet: { $gt: new Date() } });
  if (!session) return null;
  if (session.LoaiTaiKhoan === "staff") {
    const employee = await NhanVien.findById(session.chuThe);
    return employee ? { role: "staff", _id: employee._id, name: employee.hoTenNV } : null;
  }

  const reader = await DocGia.findOne({ _id: session.chuThe, HoatDong: true });  
  return reader ? { role: "reader", _id: reader._id, name: reader.HoLot + " " + reader.Ten } : null;
}