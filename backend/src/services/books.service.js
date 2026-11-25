import { normalizeSearch } from "../../../shared/search.js";
import NhaXuatBan from "../models/NhaXuatBan.js";
import Sach from "../models/Sach.js";
import { ApiError } from "../lib/errors.js";
import { ensureNoOpenBorrowing } from "./borrowing.service.js";

const labels = new Map([
  ["Văn Học Nước Ngoài", "Văn học nước ngoài"],
  ["Văn Học Trong Nước", "Văn học Việt Nam"],
  ["Sách Thiếu Nhi", "Thiếu nhi"],
  ["Kinh Tế", "Kinh tế & kỹ năng"],
  ["Lịch Sử", "Lịch sử & xã hội"],
  ["Phát Triển Bản Thân - Nghệ Thuật Sống", "Phát triển bản thân"],
  ["Kiến Thức - Khoa Học", "Kiến thức & khoa học"],
  ["Văn Hóa - Khảo Cứu - Ngôn Ngữ", "Văn hoá & khảo cứu"],
  ["Y Học - Sức Khỏe", "Y học & sức khoẻ"],
]);
