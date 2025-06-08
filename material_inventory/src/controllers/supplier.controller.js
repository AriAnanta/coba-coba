/**
 * Controller Supplier
 *
 * Mengelola operasi CRUD untuk pemasok bahan baku
 */
const db = require("../models");
const Supplier = db.Supplier;
const Material = db.Material;
const { Op } = require("sequelize");

/**
 * Mendapatkan semua pemasok
 */
exports.getAllSuppliers = async (req, res) => {
  try {
    // Filter berdasarkan parameter query
    const { status, search } = req.query;

    // Membangun kondisi WHERE
    const where = {};

    if (status) where.status = status;

    // Pencarian berdasarkan nama atau informasi kontak
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { contactPerson: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { supplierId: { [Op.like]: `%${search}%` } },
      ];
    }

    // Dapatkan data pemasok
    const suppliers = await Supplier.findAll({
      where,
      order: [["name", "ASC"]],
    });

    return res.status(200).json(suppliers);
  } catch (error) {
    console.error("Error pada getAllSuppliers:", error);
    return res.status(500).json({
      success: false,
      message: "Kesalahan server internal",
      error: error.message,
    });
  }
};

/**
 * Mendapatkan satu pemasok berdasarkan ID
 */
exports.getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    // Dapatkan pemasok dengan material terkait
    const supplier = await Supplier.findByPk(id, {
      include: [
        {
          model: Material,
          as: "materials",
          attributes: [
            "id",
            "materialId",
            "name",
            "category",
            "type",
            "stockQuantity",
            "unit",
            "price",
          ],
        },
      ],
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Pemasok tidak ditemukan",
      });
    }

    return res.status(200).json(supplier);
  } catch (error) {
    console.error("Error pada getSupplierById:", error);
    return res.status(500).json({
      success: false,
      message: "Kesalahan server internal",
      error: error.message,
    });
  }
};

/**
 * Membuat pemasok baru
 */
exports.createSupplier = async (req, res) => {
  try {
    const {
      supplierId,
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      country,
      postalCode,
      paymentTerms,
      leadTime,
      rating,
      status,
      notes,
    } = req.body;

    // Validasi input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama pemasok harus diisi",
      });
    }

    // Validasi email jika ada
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Format email tidak valid",
        });
      }
    }

    // Cek jika supplierId sudah ada
    if (supplierId) {
      const existingSupplier = await Supplier.findOne({
        where: { supplierId },
      });

      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: "Supplier ID sudah digunakan",
        });
      }
    }

    // Generate supplierId jika tidak disediakan
    const newSupplierId =
      supplierId || `SUP-${Date.now().toString().slice(-6)}`;

    // Buat pemasok baru
    const newSupplier = await Supplier.create({
      supplierId: newSupplierId,
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      country,
      postalCode,
      paymentTerms,
      leadTime: leadTime !== undefined ? leadTime : null,
      rating: rating !== undefined ? rating : null,
      status: status || "active",
      notes,
    });

    return res.status(201).json({
      success: true,
      message: "Pemasok berhasil dibuat",
      data: newSupplier,
    });
  } catch (error) {
    console.error("Error pada createSupplier:", error);
    return res.status(500).json({
      success: false,
      message: "Kesalahan server internal",
      error: error.message,
    });
  }
};

/**
 * Memperbarui pemasok
 */
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      city,
      country,
      postalCode,
      paymentTerms,
      leadTime,
      rating,
      status,
      notes,
    } = req.body;

    // Cari pemasok yang akan diupdate
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Pemasok tidak ditemukan",
      });
    }

    // Validasi email jika ada
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Format email tidak valid",
        });
      }
    }

    // Update pemasok
    await supplier.update({
      name: name || supplier.name,
      contactPerson:
        contactPerson !== undefined ? contactPerson : supplier.contactPerson,
      email: email !== undefined ? email : supplier.email,
      phone: phone !== undefined ? phone : supplier.phone,
      address: address !== undefined ? address : supplier.address,
      city: city !== undefined ? city : supplier.city,
      country: country !== undefined ? country : supplier.country,
      postalCode: postalCode !== undefined ? postalCode : supplier.postalCode,
      paymentTerms:
        paymentTerms !== undefined ? paymentTerms : supplier.paymentTerms,
      leadTime: leadTime !== undefined ? leadTime : supplier.leadTime,
      rating: rating !== undefined ? rating : supplier.rating,
      status: status || supplier.status,
      notes: notes !== undefined ? notes : supplier.notes,
    });

    return res.status(200).json({
      success: true,
      message: "Pemasok berhasil diperbarui",
      data: supplier,
    });
  } catch (error) {
    console.error("Error pada updateSupplier:", error);
    return res.status(500).json({
      success: false,
      message: "Kesalahan server internal",
      error: error.message,
    });
  }
};

/**
 * Menghapus pemasok
 */
exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari pemasok yang akan dihapus
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Pemasok tidak ditemukan",
      });
    }

    // Cek apakah pemasok memiliki material terkait
    const materialCount = await Material.count({
      where: { supplierId: id },
    });

    if (materialCount > 0) {
      // Jangan hapus, cukup set status jadi inactive
      await supplier.update({ status: "inactive" });

      return res.status(200).json({
        success: true,
        message: "Pemasok telah dinonaktifkan karena memiliki material terkait",
      });
    } else {
      // Hapus pemasok jika tidak ada material terkait
      await supplier.destroy();

      return res.status(200).json({
        success: true,
        message: "Pemasok berhasil dihapus",
      });
    }
  } catch (error) {
    console.error("Error pada deleteSupplier:", error);
    return res.status(500).json({
      success: false,
      message: "Kesalahan server internal",
      error: error.message,
    });
  }
};

/**
 * Mendapatkan material dari pemasok tertentu
 */
exports.getSupplierMaterials = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari pemasok
    const supplier = await Supplier.findByPk(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Pemasok tidak ditemukan",
      });
    }

    // Dapatkan material dari pemasok
    const materials = await Material.findAll({
      where: { supplierId: id },
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      supplier: {
        id: supplier.id,
        supplierId: supplier.supplierId,
        name: supplier.name,
        contactPerson: supplier.contactPerson,
      },
      materials,
    });
  } catch (error) {
    console.error("Error pada getSupplierMaterials:", error);
    return res.status(500).json({
      success: false,
      message: "Kesalahan server internal",
      error: error.message,
    });
  }
};

/**
 * Mendapatkan laporan kinerja pemasok
 */
exports.getSupplierPerformance = async (req, res) => {
  try {
    // Dapatkan semua pemasok aktif dengan jumlah material
    const suppliers = await Supplier.findAll({
      where: { status: "active" },
      include: [
        {
          model: Material,
          as: "materials",
          attributes: [],
        },
      ],
      attributes: [
        "id",
        "supplierId",
        "name",
        "rating",
        "leadTime",
        [
          db.sequelize.fn("COUNT", db.sequelize.col("materials.id")),
          "materialCount",
        ],
      ],
      group: ["Supplier.id"],
      order: [["rating", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("Error pada getSupplierPerformance:", error);
    return res.status(500).json({
      success: false,
      message: "Kesalahan server internal",
      error: error.message,
    });
  }
};
