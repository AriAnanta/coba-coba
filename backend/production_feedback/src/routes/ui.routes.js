/**
 * Routes UI untuk Production Feedback Service
 *
 * Mendefinisikan routing untuk UI halaman Production Feedback
 */
const express = require("express");
const router = express.Router();
const {
  verifyToken,
  checkRole,
} = require("../../../common/middleware/auth.middleware");
const { ProductionFeedback } = require("../models");
const axios = require("axios");
require("dotenv").config();
const { Router } = require("express");
const path = require("path");

// Middleware untuk memverifikasi autentikasi UI
const verifyAuthentication = async (req, res, next) => {
  try {
    // Cek apakah ada token di cookie
    const token = req.cookies.token;

    if (!token) {
      return res.redirect("/login");
    }

    // Verifikasi token dengan User Service
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/auth/verify-token`,
      { token },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.valid) {
      // Simpan data user di req untuk digunakan di controller
      req.user = response.data.user;
      next();
    } else {
      // Hapus cookie jika token tidak valid
      res.clearCookie("token");
      return res.redirect("/login");
    }
  } catch (error) {
    console.error("Error verifikasi token:", error);
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

// Routes untuk halaman autentikasi
router.get("/login", (req, res) => {
  res.render("auth/login", {
    title: "Login",
    error: req.query.error || null,
  });
});

router.get("/register", (req, res) => {
  res.render("auth/register", {
    title: "Registrasi Pengguna Baru",
    error: req.query.error || null,
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.redirect("/login");
});

// Routes yang membutuhkan autentikasi
router.use(verifyAuthentication);

// Dashboard
router.get(["/", "/dashboard"], async (req, res) => {
  try {
    // Ambil data untuk dashboard
    const [totalFeedback, pendingFeedback, completedFeedback] =
      await Promise.all([
        ProductionFeedback.count(),
        ProductionFeedback.count({
          where: { status: ["in_production", "on_hold", "pending"] },
        }),
        ProductionFeedback.count({ where: { status: "completed" } }),
      ]);

    // Ambil feedback terbaru
    const recentFeedback = await ProductionFeedback.findAll({
      limit: 5,
      order: [["updatedAt", "DESC"]],
      attributes: [
        "id",
        "feedbackId",
        "batchId",
        "productName",
        "status",
        "qualityScore",
        "updatedAt",
      ],
    });

    res.render("dashboard", {
      title: "Dashboard Feedback Produksi",
      user: req.user,
      stats: {
        totalFeedback,
        pendingFeedback,
        completedFeedback,
      },
      recentFeedback,
    });
  } catch (error) {
    console.error("Error dashboard:", error);
    res.render("error", {
      title: "Error",
      message: "Terjadi kesalahan saat memuat dashboard",
      error,
    });
  }
});

// Daftar semua feedback produksi
router.get("/feedback", async (req, res) => {
  try {
    // Ambil parameter paginasi dan filter
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || null;
    const search = req.query.search || null;

    // Siapkan kondisi where
    const whereCondition = {};

    if (status) {
      whereCondition.status = status;
    }

    if (search) {
      whereCondition[Op.or] = [
        { productName: { [Op.like]: `%${search}%` } },
        { batchId: { [Op.like]: `%${search}%` } },
        { orderId: { [Op.like]: `%${search}%` } },
        { feedbackId: { [Op.like]: `%${search}%` } },
      ];
    }

    // Ambil data feedback dengan paginasi
    const { count, rows: feedbacks } = await ProductionFeedback.findAndCountAll(
      {
        where: whereCondition,
        limit,
        offset,
        order: [["updatedAt", "DESC"]],
      }
    );

    // Hitung jumlah halaman
    const totalPages = Math.ceil(count / limit);

    res.render("feedback/list", {
      title: "Daftar Feedback Produksi",
      user: req.user,
      feedbacks,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages,
      },
      filters: {
        status,
        search,
      },
    });
  } catch (error) {
    console.error("Error list feedback:", error);
    res.render("error", {
      title: "Error",
      message: "Terjadi kesalahan saat memuat daftar feedback",
      error,
    });
  }
});

// Detail feedback produksi
router.get("/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil data feedback
    const feedback = await ProductionFeedback.findByPk(id);

    if (!feedback) {
      return res.render("error", {
        title: "Error",
        message: "Feedback tidak ditemukan",
        error: { status: 404 },
      });
    }

    res.render("feedback/detail", {
      title: `Detail Feedback: ${feedback.productName}`,
      user: req.user,
      feedback,
    });
  } catch (error) {
    console.error("Error detail feedback:", error);
    res.render("error", {
      title: "Error",
      message: "Terjadi kesalahan saat memuat detail feedback",
      error,
    });
  }
});

// Form tambah feedback baru
router.get(
  "/feedback/create",
  checkRole(["production_manager", "production_operator", "admin"]),
  async (req, res) => {
    try {
      res.render("feedback/create", {
        title: "Tambah Feedback Produksi Baru",
        user: req.user,
      });
    } catch (error) {
      console.error("Error form tambah feedback:", error);
      res.render("error", {
        title: "Error",
        message: "Terjadi kesalahan saat memuat form tambah feedback",
        error,
      });
    }
  }
);

// Form edit feedback
router.get(
  "/feedback/edit/:id",
  checkRole(["production_manager", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const feedback = await ProductionFeedback.findByPk(id);

      if (!feedback) {
        return res.render("error", {
          title: "Error",
          message: "Feedback tidak ditemukan",
          error: { status: 404 },
        });
      }

      res.render("feedback/edit", {
        title: `Edit Feedback: ${feedback.productName}`,
        user: req.user,
        feedback,
      });
    } catch (error) {
      console.error("Error form edit feedback:", error);
      res.render("error", {
        title: "Error",
        message: "Terjadi kesalahan saat memuat form edit feedback",
        error,
      });
    }
  }
);

// Notifikasi untuk UI
router.get("/notifications", async (req, res) => {
  try {
    // Dapatkan notifikasi untuk pengguna yang sedang login
    const notifications = await ProductionFeedback.FeedbackNotification.findAll(
      {
        where: {
          recipientType: "user",
          recipientId: req.user.id,
        },
        order: [["createdAt", "DESC"]],
      }
    );

    res.render("notifications", {
      title: "Notifikasi",
      user: req.user,
      notifications,
    });
  } catch (error) {
    console.error("Error loading notifications:", error);
    res.render("error", {
      title: "Error",
      message: "Terjadi kesalahan saat memuat notifikasi",
      error,
    });
  }
});

// Halaman profil pengguna
router.get("/profile", (req, res) => {
  try {
    res.render("profile", {
      title: "Profil Pengguna",
      user: req.user,
    });
  } catch (error) {
    console.error("Error profil:", error);
    res.render("error", {
      title: "Error",
      message: "Terjadi kesalahan saat memuat profil",
      error,
    });
  }
});

module.exports = router;
