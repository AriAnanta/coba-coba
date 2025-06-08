/**
 * Routes UI Planning
 *
 * Mengelola endpoint UI untuk perencanaan produksi
 */
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { ProductionPlan } = require("../models");

// Middleware untuk verifikasi apakah pengguna sudah login
const isAuthenticated = async (req, res, next) => {
  // Periksa apakah ada token di cookies
  const token = req.cookies?.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    // Verifikasi token melalui User Service
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/auth/verify`,
      { token }
    );

    // Tetapkan data pengguna ke request
    req.user = response.data.user;

    // Lanjutkan ke handler berikutnya
    next();
  } catch (error) {
    console.error("Token tidak valid:", error.message);
    res.clearCookie("token");
    return res.redirect("/login");
  }
};

// Middleware untuk memeriksa apakah pengguna memiliki role tertentu
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect("/login");
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).render("error", {
      user: req.user,
      error: {
        status: 403,
        message: "Anda tidak memiliki akses ke halaman ini",
      },
    });
  };
};

// Halaman Login
router.get("/login", (req, res) => {
  // Redirect ke halaman utama jika sudah login
  if (req.cookies?.token) {
    return res.redirect("/");
  }

  res.render("login", {
    title: "Login - Production Planning Service",
    error: null,
  });
});

// Proses Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validasi input
    if (!username || !password) {
      return res.render("login", {
        title: "Login - Production Planning Service",
        error: "Username dan password harus diisi",
      });
    }

    // Kirim permintaan login ke User Service
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/auth/login`,
      {
        username,
        password,
      }
    );

    // Simpan token di cookie
    res.cookie("token", response.data.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    // Redirect ke halaman utama
    return res.redirect("/");
  } catch (error) {
    console.error("Error login:", error.message);

    // Tampilkan pesan error
    return res.render("login", {
      title: "Login - Production Planning Service",
      error: "Username atau password salah",
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  // Hapus cookie token
  res.clearCookie("token");

  // Redirect ke halaman login
  return res.redirect("/login");
});

// Dashboard utama - Menampilkan ringkasan perencanaan produksi
router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Dapatkan statistik perencanaan produksi
    const plans = await ProductionPlan.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    // Hitung jumlah rencana berdasarkan status
    const draftCount = await ProductionPlan.count({
      where: { status: "draft" },
    });
    const submittedCount = await ProductionPlan.count({
      where: { status: "submitted" },
    });
    const approvedCount = await ProductionPlan.count({
      where: { status: "approved" },
    });
    const inProgressCount = await ProductionPlan.count({
      where: { status: "in_progress" },
    });
    const completedCount = await ProductionPlan.count({
      where: { status: "completed" },
    });
    const cancelledCount = await ProductionPlan.count({
      where: { status: "cancelled" },
    });

    // Dapatkan daftar permintaan produksi terbaru dari Production Management Service
    let recentRequests = [];
    try {
      const response = await axios.get(
        `${process.env.PRODUCTION_MANAGEMENT_URL}/api/production?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${req.cookies.token}`,
          },
        }
      );
      recentRequests = response.data;
    } catch (error) {
      console.error(
        "Gagal mendapatkan permintaan produksi terbaru:",
        error.message
      );
    }

    res.render("dashboard", {
      title: "Dashboard - Production Planning Service",
      user: req.user,
      plans,
      recentRequests,
      stats: {
        draft: draftCount,
        submitted: submittedCount,
        approved: approvedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        cancelled: cancelledCount,
        total:
          draftCount +
          submittedCount +
          approvedCount +
          inProgressCount +
          completedCount +
          cancelledCount,
      },
    });
  } catch (error) {
    console.error("Error dashboard:", error);
    res.status(500).render("error", {
      user: req.user,
      error: {
        status: 500,
        message: "Kesalahan server internal",
      },
    });
  }
});

// Daftar semua rencana produksi
router.get("/plans", isAuthenticated, async (req, res) => {
  try {
    // Dapatkan query filter
    const { status, priority, q } = req.query;

    // Buat filter untuk query
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (q) {
      filter[Sequelize.Op.or] = [
        { planId: { [Sequelize.Op.like]: `%${q}%` } },
        { productName: { [Sequelize.Op.like]: `%${q}%` } },
        { productionRequestId: { [Sequelize.Op.like]: `%${q}%` } },
      ];
    }

    // Dapatkan semua rencana produksi
    const plans = await ProductionPlan.findAll({
      where: filter,
      order: [["createdAt", "DESC"]],
    });

    res.render("plans/index", {
      title: "Daftar Rencana Produksi",
      user: req.user,
      plans,
      currentStatus: status || "",
      currentPriority: priority || "",
      searchQuery: q || "",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Error daftar rencana produksi:", error);
    res.status(500).render("error", {
      user: req.user,
      error: {
        status: 500,
        message: "Kesalahan server internal",
      },
    });
  }
});

// Detail rencana produksi
router.get("/plans/:id", isAuthenticated, async (req, res) => {
  try {
    const plan = await ProductionPlan.findByPk(req.params.id);

    if (!plan) {
      return res.status(404).render("error", {
        user: req.user,
        error: {
          status: 404,
          message: "Rencana produksi tidak ditemukan",
        },
      });
    }

    res.render("plans/detail", {
      title: `Detail Rencana Produksi - ${plan.planId}`,
      user: req.user,
      plan,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Error detail rencana produksi:", error);
    res.status(500).render("error", {
      user: req.user,
      error: {
        status: 500,
        message: "Kesalahan server internal",
      },
    });
  }
});

// Form membuat rencana produksi baru
router.get(
  "/plans/create",
  isAuthenticated,
  hasRole(["admin", "planner"]),
  async (req, res) => {
    res.render("plans/form", {
      title: "Buat Rencana Produksi Baru",
      user: req.user,
      plan: null,
      editMode: false,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  }
);

// Form mengedit rencana produksi
router.get(
  "/plans/:id/edit",
  isAuthenticated,
  hasRole(["admin", "planner"]),
  async (req, res) => {
    try {
      const plan = await ProductionPlan.findByPk(req.params.id);

      if (!plan) {
        return res.status(404).render("error", {
          user: req.user,
          error: {
            status: 404,
            message: "Rencana produksi tidak ditemukan",
          },
        });
      }

      res.render("plans/form", {
        title: `Edit Rencana Produksi - ${plan.planId}`,
        user: req.user,
        plan,
        editMode: true,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error("Error edit rencana produksi:", error);
      res.status(500).render("error", {
        user: req.user,
        error: {
          status: 500,
          message: "Kesalahan server internal",
        },
      });
    }
  }
);

module.exports = router;
