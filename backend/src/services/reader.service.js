function readerData(body = {}, creating) {
  const data = {};
  for (const field of ["HoLot", "Ten", "NgaySinh", "DiaChi", "DienThoai"]) {
    if (!creating && body[field] === undefined) continue;
    if (typeof body[field] !== "string" || !body[field].trim()) {
      throw new ApiError(400, field + " cần có giá trị dạng văn bản.");
    }
    data[field] = body[field];
  }
  if (body.Phai !== undefined) {
    if (typeof body.Phai !== "string")
      throw new ApiError(400, "Phái phải là văn bản.");
    data.Phai = body.Phai;
  }
  return data;
}

async function updateReader(_id, body) {
  const data = readerData(body, false);
  const reader = await DocGia.findOneAndUpdate({ _id, HoatDong: true }, data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!reader) throw new ApiError(404, "Không tìm thấy độc giả đang sử dụng.");
  return reader;
}

function profile(_id) {
  return DocGia.findById(_id);
}

async function archiveReader(_id) {
  await ensureNoOpenBorrowing({ maDocGia: _id });
  const reader = await DocGia.findOneAndUpdate(
    { _id },
    { HoatDong: false },
    { returnDocument: "after" },
  );
  if (!reader) throw new ApiError(409, "Không tìm thấy độc giả hoặc còn sách đang mượn.");
}
