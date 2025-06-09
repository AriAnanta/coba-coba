# Production Feedback Service

## Deskripsi
Production Feedback Service adalah layanan mikro yang mengelola feedback produksi dalam sistem manufaktur. Layanan ini menerima update dari Machine Queue dan membuat notifikasi berdasarkan perubahan status pada antrian mesin.

## Fitur Utama
- Menerima update dari Machine Queue melalui RabbitMQ
- Membuat dan mengelola notifikasi terkait produksi
- Menyediakan API untuk manajemen feedback produksi
- Integrasi dengan layanan lain dalam ekosistem manufaktur

## Teknologi
- Node.js
- Express.js
- Sequelize ORM
- MySQL
- RabbitMQ

## Struktur Proyek
```
production_feedback/
├── src/
│   ├── config/         # Konfigurasi database dan aplikasi
│   ├── controllers/    # Controller untuk menangani logika bisnis
│   ├── middleware/     # Middleware untuk autentikasi dan validasi
│   ├── models/         # Model database
│   ├── routes/         # Definisi rute API
│   ├── services/       # Layanan seperti consumer untuk RabbitMQ
│   ├── utils/          # Utilitas dan helper
│   └── app.js          # Entry point aplikasi
├── uploads/            # Direktori untuk file yang diunggah
├── .env                # Variabel lingkungan
├── .env.example        # Contoh variabel lingkungan
├── package.json        # Dependensi dan skrip
└── README.md           # Dokumentasi
```

## Instalasi

### Prasyarat
- Node.js (v14 atau lebih tinggi)
- MySQL
- RabbitMQ

### Langkah-langkah
1. Clone repositori
2. Instal dependensi:
   ```
   npm install
   ```
3. Salin `.env.example` ke `.env` dan sesuaikan konfigurasi:
   ```
   cp .env.example .env
   ```
4. Jalankan aplikasi:
   ```
   npm start
   ```
   Atau untuk pengembangan:
   ```
   npm run dev
   ```

## Konfigurasi RabbitMQ
Layanan ini menggunakan RabbitMQ untuk menerima update dari Machine Queue. Pastikan RabbitMQ berjalan dan dapat diakses. Konfigurasi RabbitMQ dapat diatur di file `.env`:

```
RABBITMQ_URL=amqp://localhost
QUEUE_NAME=machine_queue_updates
```

## API Endpoints

### Feedback
- `GET /api/feedback/list` - Mendapatkan semua feedback
- `GET /api/feedback/:id` - Mendapatkan feedback berdasarkan ID
- `POST /api/feedback` - Membuat feedback baru
- `PUT /api/feedback/:id` - Memperbarui feedback
- `DELETE /api/feedback/:id` - Menghapus feedback

### Consumer
- `POST /api/consumer/machine-update` - Menerima update dari Machine Queue secara manual
- `GET /api/consumer/status` - Mendapatkan status consumer

### Notifikasi
- `GET /api/feedback/notifications/all` - Mendapatkan semua notifikasi
- `POST /api/feedback/notifications` - Mengirim notifikasi
- `PUT /api/feedback/notifications/:id` - Menandai notifikasi sebagai dibaca

## Format Pesan Machine Queue
Consumer menerima pesan dari Machine Queue dengan format berikut:

```json
{
  "queueId": "MQ-12345",
  "batchId": "BATCH-6789",
  "productName": "Product A",
  "status": "in_progress",
  "quantity": 100,
  "completedQuantity": 50,
  "actualStartTime": "2023-09-15T08:00:00Z",
  "actualEndTime": "2023-09-15T16:00:00Z"
}
```

## Lisensi
ISC