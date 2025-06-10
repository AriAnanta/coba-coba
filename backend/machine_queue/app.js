/**
 * Machine Queue Management Service
 * Entry point file
 * 
 * File ini hanya mengimpor dan mengekspor aplikasi dari src/app.js
 * untuk menghindari duplikasi kode dan konflik dependensi
 */

// Impor aplikasi dari direktori src
const app = require('./src/app');

// Ekspor aplikasi untuk digunakan oleh modul lain jika diperlukan
module.exports = app;
