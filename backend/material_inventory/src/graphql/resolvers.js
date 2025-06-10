/**
 * Resolvers GraphQL untuk Material Inventory Service
 *
 * Mengimplementasikan resolvers untuk tipe, query, dan mutation pada schema GraphQL
 */
const { Op } = require("sequelize");
const { Material, Supplier, MaterialTransaction } = require("../models");
const db = require("../models"); // Import the db object

const resolvers = {
  Query: {
    // Query untuk Material
    materials: async (_, args) => {
      try {
        const where = {};

        // Remove conditional filters if not needed by the frontend anymore
        // if (args.category) where.category = args.category;
        // if (args.type) where.type = args.type;
        // if (args.status) where.status = args.status;
        // if (args.supplierId) where.supplierId = args.supplierId;

        // if (args.lowStock) {
        //   where.stockQuantity = {
        //     [Op.lte]: db.sequelize.col("reorderLevel"),
        //   };
        // }

        return await Material.findAll({
          where,
          include: [
            {
              model: Supplier,
              as: "supplierInfo",
            },
          ],
          order: [
            ["category", "ASC"],
            ["name", "ASC"],
          ],
        });
      } catch (error) {
        console.error("Error pada query materials:", error);
        throw new Error("Kesalahan saat mengambil data material");
      }
    },

    material: async (_, { id }) => {
      try {
        return await Material.findByPk(id, {
          include: [
            {
              model: Supplier,
              as: "supplierInfo",
            },
          ],
        });
      } catch (error) {
        console.error("Error pada query material:", error);
        throw new Error("Kesalahan saat mengambil data material");
      }
    },

    materialById: async (_, { materialId }) => {
      try {
        return await Material.findOne({
          where: { materialId },
          include: [
            {
              model: Supplier,
              as: "supplierInfo",
            },
          ],
        });
      } catch (error) {
        console.error("Error pada query materialById:", error);
        throw new Error("Kesalahan saat mengambil data material");
      }
    },

    materialCategories: async () => {
      try {
        const categories = await Material.findAll({
          attributes: [
            [
              db.sequelize.fn("DISTINCT", db.sequelize.col("category")),
              "category",
            ],
          ],
          order: [["category", "ASC"]],
        });

        return categories.map((c) => c.category);
      } catch (error) {
        console.error("Error pada query materialCategories:", error);
        throw new Error("Kesalahan saat mengambil kategori material");
      }
    },

    materialTypes: async () => {
      try {
        const types = await Material.findAll({
          attributes: [
            [db.sequelize.fn("DISTINCT", db.sequelize.col("type")), "type"],
          ],
          order: [["type", "ASC"]],
        });

        return types.map((t) => t.type);
      } catch (error) {
        console.error("Error pada query materialTypes:", error);
        throw new Error("Kesalahan saat mengambil tipe material");
      }
    },

    // Query untuk Supplier
    suppliers: async (_, { status }) => {
      try {
        const where = {};

        if (status) where.status = status;

        return await Supplier.findAll({
          where,
          order: [["name", "ASC"]],
        });
      } catch (error) {
        console.error("Error pada query suppliers:", error);
        throw new Error("Kesalahan saat mengambil data supplier");
      }
    },

    supplier: async (_, { id }) => {
      try {
        return await Supplier.findByPk(id);
      } catch (error) {
        console.error("Error pada query supplier:", error);
        throw new Error("Kesalahan saat mengambil data supplier");
      }
    },

    supplierById: async (_, { supplierId }) => {
      try {
        return await Supplier.findOne({
          where: { supplierId },
        });
      } catch (error) {
        console.error("Error pada query supplierById:", error);
        throw new Error("Kesalahan saat mengambil data supplier");
      }
    },

    supplierMaterials: async (_, { id }) => {
      try {
        return await Material.findAll({
          where: { supplierId: id },
          order: [["name", "ASC"]],
        });
      } catch (error) {
        console.error("Error pada query supplierMaterials:", error);
        throw new Error("Kesalahan saat mengambil material supplier");
      }
    },

    // Query untuk Transaksi
    transactions: async (
      _,
      { type, materialId, supplierId, startDate, endDate, limit = 100 }
    ) => {
      try {
        const where = {};

        if (type) where.type = type;
        if (materialId) where.materialId = materialId;
        if (supplierId) where.supplierId = supplierId;

        if (startDate || endDate) {
          where.transactionDate = {};

          if (startDate) {
            where.transactionDate[Op.gte] = new Date(startDate);
          }

          if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setDate(endDateTime.getDate() + 1);
            where.transactionDate[Op.lt] = endDateTime;
          }
        }

        return await MaterialTransaction.findAll({
          where,
          include: [
            {
              model: Material,
              as: "material",
            },
            {
              model: Supplier,
              as: "supplier",
            },
          ],
          order: [["transactionDate", "DESC"]],
          limit,
        });
      } catch (error) {
        console.error("Error pada query transactions:", error);
        throw new Error("Kesalahan saat mengambil data transaksi");
      }
    },

    transaction: async (_, { id }) => {
      try {
        return await MaterialTransaction.findByPk(id, {
          include: [
            {
              model: Material,
              as: "material",
            },
            {
              model: Supplier,
              as: "supplier",
            },
          ],
        });
      } catch (error) {
        console.error("Error pada query transaction:", error);
        throw new Error("Kesalahan saat mengambil data transaksi");
      }
    },

    materialTransactionHistory: async (_, { materialId }) => {
      try {
        return await MaterialTransaction.findAll({
          where: { materialId },
          include: [
            {
              model: Material,
              as: "material",
            },
            {
              model: Supplier,
              as: "supplier",
            },
          ],
          order: [["transactionDate", "DESC"]],
        });
      } catch (error) {
        console.error("Error pada query materialTransactionHistory:", error);
        throw new Error("Kesalahan saat mengambil riwayat transaksi material");
      }
    },

    // Query untuk Laporan
    stockReport: async (_, { category, lowStock }) => {
      try {
        const where = {};

        if (category) where.category = category;

        if (lowStock) {
          where.stockQuantity = {
            [Op.lte]: db.sequelize.col("reorderLevel"),
          };
        }

        const materials = await Material.findAll({
          where,
          include: [
            {
              model: Supplier,
              as: "supplierInfo",
            },
          ],
          order: [
            ["category", "ASC"],
            ["name", "ASC"],
          ],
        });

        // Hitung total nilai persediaan
        const totalValue = materials.reduce((sum, material) => {
          return sum + (material.price || 0) * material.stockQuantity;
        }, 0);

        // Hitung jumlah item dengan stok rendah
        const lowStockItems = materials.filter(
          (material) => material.stockQuantity <= material.reorderLevel
        ).length;

        // Dapatkan kategori unik
        const categories = [
          ...new Set(materials.map((material) => material.category)),
        ];

        return {
          totalItems: materials.length,
          totalValue,
          lowStockItems,
          categories,
          materials,
        };
      } catch (error) {
        console.error("Error pada query stockReport:", error);
        throw new Error("Kesalahan saat mengambil laporan stok");
      }
    },

    supplierPerformance: async (_, { supplierId }) => {
      try {
        // Dapatkan supplier yang akan dianalisis
        const where = {};
        if (supplierId) where.id = supplierId;

        const suppliers = await Supplier.findAll({
          where,
          order: [["name", "ASC"]],
        });

        // Untuk setiap supplier, dapatkan metrik performa
        const performance = await Promise.all(
          suppliers.map(async (supplier) => {
            // Hitung jumlah material dari supplier ini
            const materialCount = await Material.count({
              where: { supplierId: supplier.id },
            });

            // Dapatkan transaksi dengan supplier ini
            const transactions = await MaterialTransaction.findAll({
              where: {
                supplierId: supplier.id,
                type: "receipt",
              },
            });

            // Hitung nilai total transaksi
            const totalValue = transactions.reduce((sum, transaction) => {
              return sum + (transaction.totalPrice || 0);
            }, 0);

            // Performa pengiriman tepat waktu dan rating kualitas
            // Ini hanya placeholder, implementasi sebenarnya akan lebih kompleks
            const onTimeDelivery = supplier.rating || 0;
            const qualityRating = supplier.rating || 0;

            return {
              supplierId: supplier.id,
              name: supplier.name,
              totalTransactions: transactions.length,
              totalValue,
              onTimeDelivery,
              qualityRating,
              materialCount,
            };
          })
        );

        return performance;
      } catch (error) {
        console.error("Error pada query supplierPerformance:", error);
        throw new Error("Kesalahan saat mengambil performa supplier");
      }
    },

    // Fitur Pengecekan
    checkStock: async (_, { input }) => {
      try {
        // Validasi input
        if (!input || !Array.isArray(input) || input.length === 0) {
          throw new Error("Input tidak valid untuk pengecekan stok");
        }

        // Dapatkan ID material yang akan dicek
        const materialIds = input.map((item) => item.materialId);

        // Dapatkan data material
        const materials = await Material.findAll({
          where: { id: materialIds },
        });

        // Untuk setiap item input, cek ketersediaan stok
        return input.map((item) => {
          const material = materials.find((m) => m.id == item.materialId);

          if (!material) {
            return {
              materialId: item.materialId,
              name: "Material tidak ditemukan",
              available: false,
              stockQuantity: 0,
              requestedQuantity: item.quantity,
              difference: -item.quantity,
            };
          }

          const available = material.stockQuantity >= item.quantity;
          const difference = material.stockQuantity - item.quantity;

          return {
            materialId: material.id,
            name: material.name,
            available,
            stockQuantity: material.stockQuantity,
            requestedQuantity: item.quantity,
            difference,
          };
        });
      } catch (error) {
        console.error("Error pada query checkStock:", error);
        throw new Error("Kesalahan saat memeriksa stok material");
      }
    },
  },

  Mutation: {
    // Mutations untuk Material
    createMaterial: async (_, { input }) => {
      try {
        // Generasi materialId jika tidak disediakan
        if (!input.materialId) {
          const prefix = "MAT";
          const randomNum = Math.floor(10000 + Math.random() * 90000);
          input.materialId = `${prefix}${randomNum}`;
        }

        // Tetapkan status default jika tidak disediakan
        if (!input.status) {
          input.status = "active";
        }

        // Buat material baru
        const material = await Material.create(input);

        // Dapatkan material yang baru dibuat dengan supplier
        return await Material.findByPk(material.id, {
          include: [
            {
              model: Supplier,
              as: "supplierInfo",
            },
          ],
        });
      } catch (error) {
        console.error("Error pada mutation createMaterial:", error);
        throw new Error("Kesalahan saat membuat material baru");
      }
    },

    updateMaterial: async (_, { id, input }) => {
      try {
        // Cek apakah material ada
        const material = await Material.findByPk(id);

        if (!material) {
          throw new Error("Material tidak ditemukan");
        }

        // Update material
        await Material.update(input, {
          where: { id },
        });

        // Dapatkan material yang diperbarui
        return await Material.findByPk(id, {
          include: [
            {
              model: Supplier,
              as: "supplierInfo",
            },
          ],
        });
      } catch (error) {
        console.error("Error pada mutation updateMaterial:", error);
        throw new Error("Kesalahan saat memperbarui material");
      }
    },

    deleteMaterial: async (_, { id }) => {
      try {
        // Cek apakah material ada
        const material = await Material.findByPk(id);

        if (!material) {
          throw new Error("Material tidak ditemukan");
        }

        // Hapus material
        await Material.destroy({
          where: { id },
        });

        return {
          success: true,
          message: "Material berhasil dihapus",
          id,
        };
      } catch (error) {
        console.error("Error pada mutation deleteMaterial:", error);
        throw new Error("Kesalahan saat menghapus material");
      }
    },

    // Mutations untuk Supplier
    createSupplier: async (_, { input }) => {
      try {
        // Generasi supplierId jika tidak disediakan
        if (!input.supplierId) {
          const prefix = "SUP";
          const randomNum = Math.floor(10000 + Math.random() * 90000);
          input.supplierId = `${prefix}${randomNum}`;
        }

        // Tetapkan status default jika tidak disediakan
        if (!input.status) {
          input.status = "active";
        }

        // Buat supplier baru
        return await Supplier.create(input);
      } catch (error) {
        console.error("Error pada mutation createSupplier:", error);
        throw new Error("Kesalahan saat membuat supplier baru");
      }
    },

    updateSupplier: async (_, { id, input }) => {
      try {
        // Cek apakah supplier ada
        const supplier = await Supplier.findByPk(id);

        if (!supplier) {
          throw new Error("Supplier tidak ditemukan");
        }

        // Update supplier
        await Supplier.update(input, {
          where: { id },
        });

        // Dapatkan supplier yang diperbarui
        return await Supplier.findByPk(id);
      } catch (error) {
        console.error("Error pada mutation updateSupplier:", error);
        throw new Error("Kesalahan saat memperbarui supplier");
      }
    },

    deleteSupplier: async (_, { id }) => {
      try {
        // Cek apakah supplier ada
        const supplier = await Supplier.findByPk(id);

        if (!supplier) {
          throw new Error("Supplier tidak ditemukan");
        }

        // Cek apakah ada material yang terkait dengan supplier ini
        const materials = await Material.findAll({
          where: { supplierId: id },
        });

        if (materials.length > 0) {
          throw new Error(
            "Tidak dapat menghapus supplier karena masih terkait dengan material"
          );
        }

        // Hapus supplier
        await Supplier.destroy({
          where: { id },
        });

        return {
          success: true,
          message: "Supplier berhasil dihapus",
          id,
        };
      } catch (error) {
        console.error("Error pada mutation deleteSupplier:", error);
        throw new Error("Kesalahan saat menghapus supplier");
      }
    },

    // Mutations untuk Transaksi
    receiveMaterial: async (_, { input }) => {
      try {
        // Validasi input
        if (!input.materialId || !input.quantity || !input.unit) {
          throw new Error(
            "materialId, quantity, dan unit diperlukan untuk penerimaan material"
          );
        }

        // Cek apakah material ada
        const material = await Material.findByPk(input.materialId);

        if (!material) {
          throw new Error("Material tidak ditemukan");
        }

        // Tetapkan nilai default
        if (!input.transactionId) {
          const prefix = "TRX";
          const randomNum = Math.floor(10000 + Math.random() * 90000);
          const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          input.transactionId = `${prefix}${today}${randomNum}`;
        }

        if (!input.transactionDate) {
          input.transactionDate = new Date();
        }

        if (!input.type) {
          input.type = "receipt";
        }

        // Hitung total harga jika unitPrice disediakan tapi totalPrice tidak
        if (input.unitPrice && !input.totalPrice) {
          input.totalPrice = input.unitPrice * input.quantity;
        }

        // Buat transaksi
        const transaction = await MaterialTransaction.create({
          ...input,
          type: "receipt",
        });

        // Update stok material
        await Material.update(
          {
            stockQuantity: material.stockQuantity + input.quantity,
          },
          { where: { id: input.materialId } }
        );

        // Dapatkan transaksi yang baru dibuat
        return await MaterialTransaction.findByPk(transaction.id, {
          include: [
            {
              model: Material,
              as: "material",
            },
            {
              model: Supplier,
              as: "supplier",
            },
          ],
        });
      } catch (error) {
        console.error("Error pada mutation receiveMaterial:", error);
        throw new Error("Kesalahan saat menerima material");
      }
    },

    issueMaterial: async (_, { input }) => {
      try {
        // Validasi input
        if (!input.materialId || !input.quantity || !input.unit) {
          throw new Error(
            "materialId, quantity, dan unit diperlukan untuk pengeluaran material"
          );
        }

        // Cek apakah material ada
        const material = await Material.findByPk(input.materialId);

        if (!material) {
          throw new Error("Material tidak ditemukan");
        }

        // Cek ketersediaan stok
        if (material.stockQuantity < input.quantity) {
          throw new Error(
            `Stok tidak cukup. Stok saat ini: ${material.stockQuantity} ${material.unit}`
          );
        }

        // Tetapkan nilai default
        if (!input.transactionId) {
          const prefix = "TRX";
          const randomNum = Math.floor(10000 + Math.random() * 90000);
          const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          input.transactionId = `${prefix}${today}${randomNum}`;
        }

        if (!input.transactionDate) {
          input.transactionDate = new Date();
        }

        if (!input.type) {
          input.type = "issue";
        }

        // Hitung total harga jika unitPrice disediakan tapi totalPrice tidak
        if (input.unitPrice && !input.totalPrice) {
          input.totalPrice = input.unitPrice * input.quantity;
        }

        // Buat transaksi
        const transaction = await MaterialTransaction.create({
          ...input,
          type: "issue",
        });

        // Update stok material
        await Material.update(
          {
            stockQuantity: material.stockQuantity - input.quantity,
          },
          { where: { id: input.materialId } }
        );

        // Dapatkan transaksi yang baru dibuat
        return await MaterialTransaction.findByPk(transaction.id, {
          include: [
            {
              model: Material,
              as: "material",
            },
            {
              model: Supplier,
              as: "supplier",
            },
          ],
        });
      } catch (error) {
        console.error("Error pada mutation issueMaterial:", error);
        throw new Error("Kesalahan saat mengeluarkan material");
      }
    },

    createStockAdjustment: async (_, { input }) => {
      try {
        // Validasi input
        if (!input.materialId || input.quantity === undefined || !input.unit) {
          throw new Error(
            "materialId, quantity, dan unit diperlukan untuk penyesuaian stok"
          );
        }

        // Cek apakah material ada
        const material = await Material.findByPk(input.materialId);

        if (!material) {
          throw new Error("Material tidak ditemukan");
        }

        // Tetapkan nilai default
        if (!input.transactionId) {
          const prefix = "TRX";
          const randomNum = Math.floor(10000 + Math.random() * 90000);
          const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          input.transactionId = `${prefix}${today}${randomNum}`;
        }

        if (!input.transactionDate) {
          input.transactionDate = new Date();
        }

        // Buat transaksi
        const transaction = await MaterialTransaction.create({
          ...input,
          type: "adjustment",
        });

        // Update stok material
        await Material.update(
          {
            stockQuantity: material.stockQuantity + input.quantity,
          },
          { where: { id: input.materialId } }
        );

        // Dapatkan transaksi yang baru dibuat
        return await MaterialTransaction.findByPk(transaction.id, {
          include: [
            {
              model: Material,
              as: "material",
            },
            {
              model: Supplier,
              as: "supplier",
            },
          ],
        });
      } catch (error) {
        console.error("Error pada mutation createStockAdjustment:", error);
        throw new Error("Kesalahan saat melakukan penyesuaian stok");
      }
    },
  },

  // Resolvers untuk tipe
  Material: {
    transactions: async (material) => {
      try {
        return await MaterialTransaction.findAll({
          where: { materialId: material.id },
          order: [["transactionDate", "DESC"]],
          limit: 10,
        });
      } catch (error) {
        console.error("Error pada resolver Material.transactions:", error);
        return [];
      }
    },
  },

  Supplier: {
    materials: async (supplier) => {
      try {
        return await Material.findAll({
          where: { supplierId: supplier.id },
          order: [["name", "ASC"]],
        });
      } catch (error) {
        console.error("Error pada resolver Supplier.materials:", error);
        return [];
      }
    },
  },
};

module.exports = resolvers;
