import { normalizeSearch } from "../../../shared/search.js";
import NhaXuatBan from "../models/NhaXuatBan.js";
import Sach from "../models/Sach.js";
import { ApiError } from "../lib/errors.js";
import { ensureNoOpenBorrowing } from "./borrowing.service.js";

const labels = {
  "Văn Học Nước Ngoài": "Văn học nước ngoài",
  "Văn Học Trong Nước": "Văn học Việt Nam",
  "Sách Thiếu Nhi": "Thiếu nhi",
  "Kinh Tế": "Kinh tế & kỹ năng",
  "Lịch Sử": "Lịch sử & xã hội",
  "Phát Triển Bản Thân - Nghệ Thuật Sống": "Phát triển bản thân",
  "Kiến Thức - Khoa Học": "Kiến thức & khoa học",
  "Văn Hóa - Khảo Cứu - Ngôn Ngữ": "Văn hoá & khảo cứu",
  "Y Học - Sức Khỏe": "Y học & sức khoẻ",
};

// Tính số quyển còn và thêm vào dữ liệu sách trả cho giao diện.
async function withStock(document) {
  const book = document.toObject();
  const borrowed = await TheoDoiMuonSach.countDocuments({
    maSach: book._id,
    ngayTra: null,
  });
  book.SoQuyenCon = book.SoQuyen - borrowed;
  return book;
}

// Đọc sách theo điều kiện rồi thêm số quyển còn và tên nhà xuất bản.
async function readBooks(filter) {
  const documents = await Sach.find(filter).sort({ TenSach: 1 });
  const books = [];
  for (const document of documents) {
    const book = await withStock(document);
    book.NhaXuatBan = await NhaXuatBan.findById(book.maNXB).select("TenNXB");
    book.ChuDe = labels[book.ChuDe] || book.ChuDe;
    books.push(book);
  }

  return books;
}

async function archiveBook(_id) {
  const book = await Sach.findById(_id);
  if (!book) throw new ApiError(404, "Không tìm thấy sách.");
  await ensureNoOpenBorrowing({ maSach: book._id });
  await Sach.findByIdAndUpdate(_id, { DangHienThi: false });
}

function bookData(body = {}, creating) {
  const data = {};
  for (const field of ["TenSach", "maNXB", "NguonGoc/TacGia", "MoTa", "ChuDe", "ViTriKe"]) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== "string") throw new ApiError(400, field + " phải là văn bản.");
    data[field] = body[field];
  }
  if (!data.maNXB?.trim() || (creating && !data.TenSach?.trim()) || data.TenSach?.trim() === "") {
    throw new ApiError(400, "Vui lòng nhập tên sách và chọn nhà xuất bản.");
  }
  for (const field of ["DonGia", "SoQuyen", "NamXuatBan"]) {
    if (body[field] === undefined && (!creating || field === "NamXuatBan")) continue;
    if (!Number.isFinite(body[field])) throw new ApiError(400, field + " phải là số.");
    data[field] = body[field];
  }
  if (body.NhanKe !== undefined) {
    if (!Array.isArray(body.NhanKe)) throw new ApiError(400, "Nhãn kệ phải là danh sách.");
    for (const shelf of body.NhanKe) {
      if (typeof shelf !== "string") throw new ApiError(400, "Nhãn kệ phải là văn bản.");
    }
    data.NhanKe = body.NhanKe;
  }
  return data;
}

async function updateBook(_id, body) {
  const data = bookData(body, false);
  await checkPublisher(data.maNXB);

  const book = await Sach.findOne({ _id, DangHienThi: true });
  if (!book) throw new ApiError(404, "Không tìm thấy sách đang sử dụng.");

  const borrowed = await TheoDoiMuonSach.countDocuments({ maSach: _id, ngayTra: null });
  if (data.SoQuyen < borrowed) throw new ApiError(409, "Tổng số quyển không thể thấp hơn số đang được mượn.");
  if ((data.TenSach !== undefined && book.TenSach !== data.TenSach)
      // Tiếp tục điều kiện hoặc giá trị ở dòng trên.
      || (data["NguonGoc/TacGia"] !== undefined && book["NguonGoc/TacGia"] !== data["NguonGoc/TacGia"])
      || (data.NamXuatBan !== undefined && book.NamXuatBan !== data.NamXuatBan)
      || !book.maNXB.equals(data.maNXB)) {
    // Cập nhật data.DoiChieuThuMuc.
    data.DoiChieuThuMuc = false;
  }
  const updated = await Sach.findOneAndUpdate(
    { _id, DangHienThi: true },
    data, { returnDocument: "after", runValidators: true },
  );
  if (!updated) throw new ApiError(409, "Không tìm thấy sách đang sử dụng.");
  return updated;
}

async function checkPublisher(maNXB) {
  if (!(await NhaXuatBan.findOne({ _id: maNXB, NgungSuDung: false }))) {
    throw new ApiError(404, "Không tìm thấy nhà xuất bản đang sử dụng.");
  }
}

async function createBook(body) {
  const data = bookData(body, true);
  await checkPublisher(data.maNXB);
  return Sach.create(data);
}

async function listBooks() {
  const documents = await Sach.find().sort({ TenSach: 1 });
  const books = [];
  for (const document of documents) {
    books.push(await withStock(document));
  }
  return books;
}

async function browseBooks(query) {
  const { q = "", shelf = "tat-ca", available, category, sort = "title-asc", page = 1 } = query;
  const books = await readBooks({ DangHienThi: true });
  const search = normalizeSearch(q);
  const matching = [];
  const categories = [];
  for (const book of books) {
    if (book.ChuDe && !categories.includes(book.ChuDe)) categories.push(book.ChuDe);
    if (shelf !== "tat-ca" && !book.NhanKe.includes(shelf)) continue;
    if (category && book.ChuDe !== category) continue;
    if (available === "true" && book.SoQuyenCon <= 0) continue;
    const title = normalizeSearch(book.TenSach);
    const author = normalizeSearch(book["NguonGoc/TacGia"] || "");
    const publisher = normalizeSearch(book.NhaXuatBan?.TenNXB || "");
    const isbn = normalizeSearch(book.ISBN || "");
    if (search && !title.includes(search) && !author.includes(search) && !publisher.includes(search) && !isbn.includes(search)) continue;
    matching.push(book);
  }

  // Mỗi lựa chọn sắp xếp tương ứng một điều kiện, không cần bảng hàm.
  if (sort === "title-asc") matching.sort((a, b) => a.TenSach.localeCompare(b.TenSach, "vi"));
  // Kiểm tra điều kiện trước khi chạy phần bên dưới.
  if (sort === "title-desc") matching.sort((a, b) => b.TenSach.localeCompare(a.TenSach, "vi"));
  // Kiểm tra điều kiện trước khi chạy phần bên dưới.
  if (sort === "year-desc") matching.sort((a, b) => b.NamXuatBan - a.NamXuatBan);
  // Kiểm tra điều kiện trước khi chạy phần bên dưới.
  if (sort === "available-desc") matching.sort((a, b) => b.SoQuyenCon - a.SoQuyenCon);
  // Gọi categories.sort với dữ liệu bên dưới hoặc trên cùng dòng.
  categories.sort((a, b) => a.localeCompare(b, "vi"));

  // Đặt giá trị cho pageSize.
  const pageSize = 12;
  // Đặt giá trị cho số trang kết quả.
  const pages = Math.ceil(matching.length / pageSize);
  // Đặt giá trị cho currentPage.
  let currentPage = Math.floor(page) || 1;
  // Kiểm tra điều kiện trước khi chạy phần bên dưới.
  if (currentPage < 1) currentPage = 1;
  // Kiểm tra điều kiện trước khi chạy phần bên dưới.
  if (pages > 0 && currentPage > pages) currentPage = pages;
  // Đặt giá trị cho offset.
  const offset = (currentPage - 1) * pageSize;
  // Trả các trường bên dưới cho hàm đã gọi.
  return {
    // Đặt dữ liệu trả về.
    data: matching.slice(offset, offset + pageSize), total: matching.length, page: currentPage, pages, pageSize,
    // Khai báo hàm được gọi khi thao tác ở trên chạy.
    categories, featured: books.find((book) => book.NhanManh) || books[0] || null,
  };
}

async function getBookDetails(id) {
  const document = await Sach.findOne({ _id: id, DangHienThi: true });
  if (!document) throw new ApiError(404, "Không tìm thấy cuốn sách này.");
  const book = await withStock(document);

  book.NhaXuatBan = await NhaXuatBan.findById(book.maNXB).select("TenNXB");
  book.ChuDe = labels[book.ChuDe] || book.ChuDe;
  const sameShelf = await Sach.find({
    _id: { $ne: book._id },
    DangHienThi: true,
    NhanKe: { $in: book.NhanKe },
  })
    .sort({ TenSach: 1 })
    .limit(4);

    const related = [];
  for (const item of sameShelf) {
    related.push(await withStock(item));
  }
  return { data: book, related };
}

module.exports = {
  browseBooks,
  getBookDetails,
  listBooks,
  createBook,
  updateBook,
  archiveBook,
};
