const { connectDB, closeDB } = require("../utils/mongodb.util");

const sachSchema = {
  bsonType: "object",
  required: [
    "MaSach",
    "TenSach",
    "DonGia",
    "SoQuyen",
    "NamXuatBan",
    "MaNXB",
    "NguonGoc/TacGia",
  ],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    MaSach: { bsonType: "string" },
    TenSach: { bsonType: "string" },
    DonGia: { bsonType: "number", minimum: 0 },
    SoQuyen: { bsonType: "int", minimum: 0 },
    MaNXB: { bsonType: "string" },
    NamXuatBan: { bsonType: "int" },
    "NguonGoc/TacGia": { bsonType: "string" },
  },
};

const nxbSchema = {
  bsonType: "object",
  required: ["MaNXB", "TenNXB", "DiaChi"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    MaNXB: { bsonType: "string" },
    TenNXB: { bsonType: "string" },
    DiaChi: { bsonType: "string" },
  },
};

const docGiaSchema = {
  bsonType: "object",
  required: [
    "MaDocGia",
    "HoLot",
    "Ten",
    "NgaySinh",
    "Phai",
    "DiaChi",
    "DienThoai",
  ],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    MaDocGia: { bsonType: "string" },
    HoLot: { bsonType: "string" },
    Ten: { bsonType: "string" },
    NgaySinh: { bsonType: "date" },
    Phai: { bsonType: "string" },
    DiaChi: { bsonType: "string" },
    DienThoai: { bsonType: "string" },
  },
};

const nhanVienSchema = {
  bsonType: "object",
  required: ["MSNV", "HoTenNV", "Password", "ChucVu", "DiaChi", "SoDienThoai"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    MSNV: { bsonType: "string" },
    HoTenNV: { bsonType: "string" },
    Password: { bsonType: "string" },
    ChucVu: { bsonType: "string" },
    DiaChi: { bsonType: "string" },
    SoDienThoai: { bsonType: "string" },
  },
};

const theoDoiMuonSachSchema = {
  bsonType: "object",
  required: ["MaDocGia", "MaSach", "NgayMuon", "NgayTra"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    MaDocGia: { bsonType: "string" },
    MaSach: { bsonType: "string" },
    NgayMuon: { bsonType: "date" },
    NgayTra: { bsonType: ["date", "null"] },
  },
};

async function initializeDatabase(db) {
    const collections = [ "Sach", "NhaXuatBan", "DocGia", "NhanVien", "TheoDoiMuonSach" ];

    for(const collection of collections) {
        const exists = await db
            .listCollections({ name: collection }, {nameOnly: true})
            .hasNext();
        
        if(exists) {
            throw new Error(`Collection ${collection} already exists`);
        }
    }

    await db.createCollection("Sach", {
        validator: {
            $jsonSchema: sachSchema
        },
        validationAction: "error"
    });

    await db.createCollection("NhaXuatBan", {
      validator: {
        $jsonSchema: nxbSchema,
      },
      validationAction: "error",
    });

    await db.createCollection("DocGia", {
      validator: {
        $jsonSchema: docGiaSchema,
      },
      validationAction: "error",
    });

    await db.createCollection("NhanVien", {
      validator: {
        $jsonSchema: nhanVienSchema,
      },
      validationAction: "error",
    });

    await db.createCollection("TheoDoiMuonSach", {
      validator: {
        $jsonSchema: theoDoiMuonSachSchema,
      },
      validationAction: "error",
    });

    await db.collection("Sach").createIndex({ MaSach: 1 }, { unique: true });
    await db.collection("NhaXuatBan").createIndex({ MaNXB: 1}, { unique: true });
    await db.collection("DocGia").createIndex({ MaDocGia: 1 }, { unique: true });
    await db.collection("NhanVien").createIndex({ MSNV: 1 }, { unique: true });
    await db.collection("TheoDoiMuonSach").createIndex({  MaDocGia: 1, MaSach: 1, NgayMuon: 1 }, { unique: true });
}

async function controlInitialization() {
    let flag = false;
    try {
        const db = await connectDB();
        flag = true;
        await initializeDatabase(db);
        console.log("Connected and initialized.");
    } catch (error) {
        console.error("Initialization failed:", error);
        process.exitCode = 1;
    } finally {
        if (flag) {
            await closeDB();
        }
    }
}

controlInitialization();