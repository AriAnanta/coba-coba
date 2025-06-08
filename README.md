# Aplikasi On-Demand Manufacturing

Aplikasi ini merupakan sistem mikroservis untuk mengelola proses manufaktur on-demand, yang terdiri dari beberapa layanan yang saling terintegrasi dengan arsitektur GraphQL API Gateway dan REST API untuk komunikasi internal.

## Daftar Layanan

1. **API Gateway** - GraphQL API Gateway untuk mengintegrasikan semua layanan
2. **User Service** - Layanan terpusat untuk autentikasi dan manajemen pengguna
3. **Production Management Service** - Layanan utama untuk mengelola permintaan produksi
4. **Production Planning Service** - Layanan perencanaan kapasitas dan penjadwalan
5. **Machine Queue Service** - Layanan pengelolaan antrian mesin
6. **Material Inventory Service** - Layanan pengelolaan inventaris bahan baku
7. **Production Feedback Service** - Layanan pencatatan status dan hasil produksi
8. **Frontend** - Aplikasi React dengan Material UI

## Prasyarat

Sebelum menjalankan aplikasi, pastikan sistem Anda telah memiliki:

- Node.js (v14.x atau lebih tinggi)
- NPM (v6.x atau lebih tinggi)
- MySQL (v5.7 atau lebih tinggi)
- Git
- Docker dan Docker Compose (opsional, untuk deployment dengan container)

### Instalasi Dependensi

Untuk menginstal dependensi semua layanan sekaligus:

```bash
# Pada direktori utama
npm run install-all

# Atau instalasi manual untuk setiap layanan
cd user_service && npm install
cd ../production_management && npm install
cd ../production_planning && npm install
cd ../machine_queue && npm install
cd ../material_inventory && npm install
cd ../production_feedback && npm install
```

### Konfigurasi Environment

Salin file `.env.example` menjadi `.env` di setiap direktori layanan:

```bash
# Contoh untuk satu layanan
cd user_service
cp .env.example .env
```

Konfigurasi file `.env` untuk setiap layanan dengan detail database dan konfigurasi lainnya:

```
# Konfigurasi Database
DB_HOST=localhost
DB_PORT=3308
DB_USER=root
DB_PASS=password
DB_NAME=on_demand_manufacturing_[nama_layanan]

# Konfigurasi Server
PORT=5000 # Berbeda untuk setiap layanan
NODE_ENV=development

# URL Layanan
USER_SERVICE_URL=http://localhost:5006
PRODUCTION_MANAGEMENT_URL=http://localhost:5001
PRODUCTION_PLANNING_URL=http://localhost:5002
MACHINE_QUEUE_URL=http://localhost:5003
MATERIAL_INVENTORY_URL=http://localhost:5004
PRODUCTION_FEEDBACK_URL=http://localhost:5005

# Konfigurasi JWT
JWT_SECRET=rahasiajwt
JWT_EXPIRATION=1d

# Konfigurasi Upload
UPLOAD_DIR=uploads
```

### Inisialisasi Database

Buat database MySQL untuk setiap layanan:

```sql
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_user;
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_production_management;
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_production_planning;
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_machine_queue;
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_material_inventory;
CREATE DATABASE IF NOT EXISTS on_demand_manufacturing_production_feedback;
```

## Menjalankan Aplikasi

### 1. Menjalankan Semua Layanan

Gunakan script berikut untuk menjalankan semua layanan sekaligus:

```bash
# Dari direktori utama
npm run start-all
```

### Menjalankan Layanan Tertentu

Untuk menjalankan layanan tertentu secara terpisah:

```bash
# Contoh untuk Production Feedback Service
cd production_feedback
npm run start

# Atau dengan nodemon untuk development
npm run dev
```

## Pengujian GraphQL

Setiap layanan memiliki endpoint GraphQL yang dapat diuji menggunakan Apollo Sandbox atau tools lain seperti Postman.

### Menggunakan Apollo Sandbox

Apollo Sandbox tersedia di endpoint GraphQL masing-masing layanan:

```
http://localhost:5001/graphql  # Production Management
http://localhost:5002/graphql  # Production Planning
http://localhost:5003/graphql  # Machine Queue
http://localhost:5004/graphql  # Material Inventory
http://localhost:5005/graphql  # Production Feedback
```

## Menjalankan dengan Docker

Untuk menjalankan aplikasi menggunakan Docker:

1. Pastikan Docker dan Docker Compose sudah terinstal di sistem Anda
2. Jalankan perintah berikut di direktori root proyek:

```bash
docker-compose up -d
```

3. Akses aplikasi frontend di browser melalui `http://localhost`
4. Akses GraphQL API Gateway di `http://localhost:5000/graphql`

## Kontribusi

Untuk kontribusi pengembangan:

1. Fork repository
2. Buat branch fitur baru (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -am 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request baru

## Dokumentasi GraphQL API

Berikut adalah dokumentasi lengkap untuk setiap layanan yang mengekspos API GraphQL.

### 1. Machine Queue Service

**Endpoint:** `http://localhost:5003/graphql`

#### Tipe Kustom

- **`Date`**: Tipe skalar untuk representasi waktu.
- **`MachineStatus`**: Status mesin (`operational`, `maintenance`, `breakdown`, `inactive`).
- **`QueueStatus`**: Status antrian (`waiting`, `in_progress`, `completed`, `paused`, `cancelled`).
- **`QueuePriority`**: Prioritas antrian (`low`, `normal`, `high`, `urgent`).
- **`Machine`** (Mesin):
  - `id`: `ID!` (Wajib, ID unik)
  - `machineId`: `String!` (Wajib, ID mesin unik)
  - `name`: `String!` (Wajib, Nama mesin)
  - `type`: `String!` (Wajib, Tipe mesin)
  - `manufacturer`: `String` (Produsen)
  - `modelNumber`: `String` (Nomor model)
  - `capacity`: `Float` (Kapasitas)
  - `capacityUnit`: `String` (Satuan kapasitas)
  - `location`: `String` (Lokasi)
  - `installationDate`: `Date` (Tanggal instalasi)
  - `lastMaintenance`: `Date` (Tanggal perawatan terakhir)
  - `nextMaintenance`: `Date` (Tanggal perawatan berikutnya)
  - `status`: `MachineStatus!` (Wajib, Status mesin)
  - `hoursPerDay`: `Float!` (Wajib, Jam kerja per hari)
  - `notes`: `String` (Catatan)
  - `createdAt`: `Date!` (Wajib, Tanggal dibuat)
  - `updatedAt`: `Date!` (Wajib, Tanggal diperbarui)
  - `queues`: `[MachineQueue]` (Daftar antrian terkait)
- **`MachineQueue`** (Antrian Mesin):
  - `id`: `ID!` (Wajib, ID unik)
  - `queueId`: `String!` (Wajib, ID antrian unik)
  - `machineId`: `ID!` (Wajib, ID mesin)
  - `batchId`: `ID!` (Wajib, ID batch)
  - `batchNumber`: `String!` (Wajib, Nomor batch)
  - `productName`: `String!` (Wajib, Nama produk)
  - `stepId`: `ID` (ID langkah)
  - `stepName`: `String` (Nama langkah)
  - `scheduledStartTime`: `Date` (Waktu mulai terjadwal)
  - `scheduledEndTime`: `Date` (Waktu selesai terjadwal)
  - `actualStartTime`: `Date` (Waktu mulai aktual)
  - `actualEndTime`: `Date` (Waktu selesai aktual)
  - `hoursRequired`: `Float!` (Wajib, Jam yang dibutuhkan)
  - `priority`: `QueuePriority!` (Wajib, Prioritas)
  - `status`: `QueueStatus!` (Wajib, Status)
  - `operatorId`: `String` (ID operator)
  - `operatorName`: `String` (Nama operator)
  - `setupTime`: `Float` (Waktu setup)
  - `position`: `Int!` (Wajib, Posisi dalam antrian)
  - `notes`: `String` (Catatan)
  - `createdAt`: `Date!` (Wajib, Tanggal dibuat)
  - `updatedAt`: `Date!` (Wajib, Tanggal diperbarui)
  - `machine`: `Machine` (Data mesin terkait)
- **`CapacityResponse`** (Respons Kapasitas):
  - `available`: `Boolean!` (Wajib, Ketersediaan)
  - `message`: `String!` (Wajib, Pesan)
  - `machines`: `[Machine]` (Daftar mesin yang tersedia)

#### Tipe Input

- **`MachineFilter`**: Filter untuk memperoleh mesin.
  - `type`: `String` (Tipe mesin)
  - `status`: `MachineStatus` (Status mesin)
- **`QueueFilter`**: Filter untuk memperoleh antrian.
  - `machineId`: `ID` (ID mesin)
  - `batchId`: `ID` (ID batch)
  - `status`: `QueueStatus` (Status antrian)
  - `priority`: `QueuePriority` (Prioritas antrian)
- **`CreateMachineInput`**: Input untuk membuat mesin baru.
  - `name`: `String!` (Wajib, Nama mesin)
  - `type`: `String!` (Wajib, Tipe mesin)
  - `manufacturer`: `String`
  - `modelNumber`: `String`
  - `capacity`: `Float`
  - `capacityUnit`: `String`
  - `location`: `String`
  - `installationDate`: `String`
  - `hoursPerDay`: `Float`
  - `notes`: `String`
- **`CreateQueueInput`**: Input untuk membuat antrian baru.
  - `machineId`: `ID!` (Wajib)
  - `batchId`: `ID!` (Wajib)
  - `batchNumber`: `String!` (Wajib)
  - `productName`: `String!` (Wajib)
  - `stepId`: `ID`
  - `stepName`: `String`
  - `scheduledStartTime`: `String`
  - `scheduledEndTime`: `String`
  - `hoursRequired`: `Float!` (Wajib)
  - `priority`: `QueuePriority`
  - `operatorId`: `String`
  - `operatorName`: `String`
  - `setupTime`: `Float`
  - `notes`: `String`
- **`UpdateMachineInput`**: Input untuk memperbarui mesin.
  - `name`: `String`
  - `type`: `String`
  - `manufacturer`: `String`
  - `modelNumber`: `String`
  - `capacity`: `Float`
  - `capacityUnit`: `String`
  - `location`: `String`
  - `installationDate`: `String`
  - `lastMaintenance`: `String`
  - `nextMaintenance`: `String`
  - `status`: `MachineStatus`
  - `hoursPerDay`: `Float`
  - `notes`: `String`
- **`UpdateQueueInput`**: Input untuk memperbarui antrian.
  - `machineId`: `ID`
  - `scheduledStartTime`: `String`
  - `scheduledEndTime`: `String`
  - `actualStartTime`: `String`
  - `actualEndTime`: `String`
  - `hoursRequired`: `Float`
  - `priority`: `QueuePriority`
  - `status`: `QueueStatus`
  - `operatorId`: `String`
  - `operatorName`: `String`
  - `setupTime`: `Float`
  - `position`: `Int`
  - `notes`: `String`

#### Queries

- **`machines(filter: MachineFilter)`**: Mendapatkan semua mesin.
  - **Argumen:**
    - `filter`: `MachineFilter` (Opsional, filter mesin berdasarkan tipe atau status).
  - **Output:** `[Machine]` (Daftar objek Mesin).
- **`machine(id: ID!)`**: Mendapatkan mesin berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik mesin).
  - **Output:** `Machine` (Objek Mesin).
- **`machineTypes`**: Mendapatkan semua tipe mesin yang tersedia.
  - **Argumen:** Tidak ada.
  - **Output:** `[String]` (Daftar tipe mesin).
- **`queues(filter: QueueFilter)`**: Mendapatkan semua antrian.
  - **Argumen:**
    - `filter`: `QueueFilter` (Opsional, filter antrian berdasarkan ID mesin, ID batch, status, atau prioritas).
  - **Output:** `[MachineQueue]` (Daftar objek MachineQueue).
- **`queue(id: ID!)`**: Mendapatkan antrian berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik antrian).
  - **Output:** `MachineQueue` (Objek MachineQueue).
- **`machineQueues(machineId: ID!)`**: Mendapatkan antrian untuk mesin tertentu.
  - **Argumen:**
    - `machineId`: `ID!` (Wajib, ID mesin).
  - **Output:** `[MachineQueue]` (Daftar objek MachineQueue).
- **`batchQueues(batchId: ID!)`**: Mendapatkan antrian untuk batch tertentu.
  - **Argumen:**
    - `batchId`: `ID!` (Wajib, ID batch).
  - **Output:** `[MachineQueue]` (Daftar objek MachineQueue).
- **`checkCapacity(machineType: String!, hoursRequired: Float!, startDate: String, endDate: String)`**: Memeriksa ketersediaan kapasitas mesin untuk waktu tertentu.
  - **Argumen:**
    - `machineType`: `String!` (Wajib, Tipe mesin).
    - `hoursRequired`: `Float!` (Wajib, Jumlah jam yang dibutuhkan).
    - `startDate`: `String` (Opsional, Tanggal mulai. Default: sekarang).
    - `endDate`: `String` (Opsional, Tanggal selesai. Default: startDate + hoursRequired).
  - **Output:** `CapacityResponse` (Objek CapacityResponse yang menunjukkan ketersediaan).

#### Mutations

- **`createMachine(input: CreateMachineInput!)`**: Membuat mesin baru.
  - **Argumen:**
    - `input`: `CreateMachineInput!` (Wajib, data mesin baru).
  - **Output:** `Machine` (Objek Mesin yang baru dibuat).
- **`updateMachine(id: ID!, input: UpdateMachineInput!)`**: Memperbarui mesin.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik mesin yang akan diperbarui).
    - `input`: `UpdateMachineInput!` (Wajib, data mesin yang akan diperbarui).
  - **Output:** `Machine` (Objek Mesin yang diperbarui).
- **`deleteMachine(id: ID!)`**: Menghapus mesin.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik mesin yang akan dihapus).
  - **Output:** `Boolean` (True jika berhasil dihapus, false jika gagal).
- **`createQueue(input: CreateQueueInput!)`**: Membuat antrian baru.
  - **Argumen:**
    - `input`: `CreateQueueInput!` (Wajib, data antrian baru).
  - **Output:** `MachineQueue` (Objek MachineQueue yang baru dibuat).
- **`updateQueue(id: ID!, input: UpdateQueueInput!)`**: Memperbarui antrian.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik antrian yang akan diperbarui).
    - `input`: `UpdateQueueInput!` (Wajib, data antrian yang akan diperbarui).
  - **Output:** `MachineQueue` (Objek MachineQueue yang diperbarui).
- **`deleteQueue(id: ID!)`**: Menghapus antrian.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik antrian yang akan dihapus).
  - **Output:** `Boolean` (True jika berhasil dihapus, false jika gagal).
- **`changeQueuePriority(id: ID!, priority: QueuePriority!)`**: Mengubah prioritas antrian.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik antrian).
    - `priority`: `QueuePriority!` (Wajib, prioritas baru).
  - **Output:** `MachineQueue` (Objek MachineQueue yang diperbarui).
- **`reorderQueue(id: ID!, newPosition: Int!)`**: Mengubah urutan antrian.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik antrian).
    - `newPosition`: `Int!` (Wajib, posisi baru dalam antrian).
  - **Output:** `MachineQueue` (Objek MachineQueue yang diperbarui).
- **`startQueue(id: ID!, operatorId: String, operatorName: String)`**: Memulai pekerjaan antrian.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik antrian).
    - `operatorId`: `String` (Opsional, ID operator).
    - `operatorName`: `String` (Opsional, Nama operator).
  - **Output:** `MachineQueue` (Objek MachineQueue yang diperbarui).
- **`completeQueue(id: ID!, notes: String)`**: Menyelesaikan pekerjaan antrian.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik antrian).
    - `notes`: `String` (Opsional, catatan penyelesaian).
  - **Output:** `MachineQueue` (Objek MachineQueue yang diperbarui).

### 2. Material Inventory Service

**Endpoint:** `http://localhost:5004/graphql`

#### Tipe Kustom

- **`Material`** (Material):
  - `id`: `ID!` (Wajib, ID unik)
  - `materialId`: `String!` (Wajib, ID material unik)
  - `name`: `String!` (Wajib, Nama material)
  - `description`: `String` (Deskripsi)
  - `category`: `String!` (Wajib, Kategori material)
  - `type`: `String!` (Wajib, Tipe material)
  - `unit`: `String!` (Wajib, Satuan)
  - `stockQuantity`: `Float!` (Wajib, Jumlah stok)
  - `reorderLevel`: `Float` (Tingkat pemesanan ulang)
  - `price`: `Float` (Harga per unit)
  - `leadTime`: `Int` (Waktu tunggu dalam hari)
  - `location`: `String` (Lokasi penyimpanan)
  - `supplierId`: `ID` (ID pemasok)
  - `status`: `String!` (Wajib, Status material)
  - `notes`: `String` (Catatan)
  - `createdAt`: `String` (Tanggal dibuat)
  - `updatedAt`: `String` (Tanggal diperbarui)
  - `supplierInfo`: `Supplier` (Informasi pemasok terkait)
  - `transactions`: `[MaterialTransaction]` (Daftar transaksi terkait)
- **`Supplier`** (Pemasok):
  - `id`: `ID!` (Wajib, ID unik)
  - `supplierId`: `String!` (Wajib, ID pemasok unik)
  - `name`: `String!` (Wajib, Nama pemasok)
  - `address`: `String` (Alamat)
  - `city`: `String` (Kota)
  - `state`: `String` (Negara bagian)
  - `postalCode`: `String` (Kode pos)
  - `country`: `String` (Negara)
  - `contactPerson`: `String` (Kontak person)
  - `phone`: `String` (Telepon)
  - `email`: `String` (Email)
  - `website`: `String` (Situs web)
  - `paymentTerms`: `String` (Syarat pembayaran)
  - `leadTime`: `Int` (Waktu tunggu dalam hari)
  - `rating`: `Float` (Rating)
  - `status`: `String!` (Wajib, Status)
  - `notes`: `String` (Catatan)
  - `createdAt`: `String` (Tanggal dibuat)
  - `updatedAt`: `String` (Tanggal diperbarui)
  - `materials`: `[Material]` (Daftar material yang disediakan)
- **`MaterialTransaction`** (Transaksi Material):
  - `id`: `ID!` (Wajib, ID unik)
  - `transactionId`: `String!` (Wajib, ID transaksi unik)
  - `type`: `String!` (Wajib, Tipe transaksi)
  - `materialId`: `ID!` (Wajib, ID material)
  - `quantity`: `Float!` (Wajib, Jumlah)
  - `unit`: `String!` (Wajib, Satuan)
  - `transactionDate`: `String!` (Wajib, Tanggal transaksi)
  - `supplierId`: `ID` (ID pemasok)
  - `referenceNumber`: `String` (Nomor referensi)
  - `unitPrice`: `Float` (Harga per unit)
  - `totalPrice`: `Float` (Harga total)
  - `notes`: `String` (Catatan)
  - `createdBy`: `String` (Dibuat oleh)
  - `createdAt`: `String` (Tanggal dibuat)
  - `updatedAt`: `String` (Tanggal diperbarui)
  - `material`: `Material` (Material terkait)
  - `supplier`: `Supplier` (Pemasok terkait)
- **`StockReport`** (Laporan Stok):
  - `totalItems`: `Int!` (Wajib, Total item)
  - `totalValue`: `Float` (Nilai total persediaan)
  - `lowStockItems`: `Int` (Jumlah item stok rendah)
  - `categories`: `[String]` (Kategori material)
  - `materials`: `[Material]` (Daftar material)
- **`SupplierPerformance`** (Kinerja Pemasok):
  - `supplierId`: `ID!` (Wajib, ID pemasok)
  - `name`: `String!` (Wajib, Nama pemasok)
  - `totalTransactions`: `Int` (Total transaksi)
  - `totalValue`: `Float` (Nilai total transaksi)
  - `onTimeDelivery`: `Float` (Tingkat pengiriman tepat waktu)
  - `qualityRating`: `Float` (Rating kualitas)
  - `materialCount`: `Int` (Jumlah material yang disediakan)
- **`GenericResponse`** (Respons Generik):
  - `success`: `Boolean!` (Wajib, Status keberhasilan)
  - `message`: `String` (Pesan)
  - `id`: `ID` (ID terkait)
- **`StockCheckResult`** (Hasil Cek Stok):
  - `materialId`: `ID!` (Wajib, ID material)
  - `name`: `String!` (Wajib, Nama material)
  - `available`: `Boolean!` (Wajib, Ketersediaan)
  - `stockQuantity`: `Float!` (Wajib, Jumlah stok saat ini)
  - `requestedQuantity`: `Float!` (Wajib, Jumlah yang diminta)
  - `difference`: `Float!` (Wajib, Selisih stok)

#### Tipe Input

- **`MaterialInput`**: Input untuk material.
  - `materialId`: `String`
  - `name`: `String!` (Wajib)
  - `description`: `String`
  - `category`: `String!` (Wajib)
  - `type`: `String!` (Wajib)
  - `unit`: `String!` (Wajib)
  - `stockQuantity`: `Float`
  - `reorderLevel`: `Float`
  - `price`: `Float`
  - `leadTime`: `Int`
  - `location`: `String`
  - `supplierId`: `ID`
  - `status`: `String`
  - `notes`: `String`
- **`SupplierInput`**: Input untuk pemasok.
  - `supplierId`: `String`
  - `name`: `String!` (Wajib)
  - `address`: `String`
  - `city`: `String`
  - `state`: `String`
  - `postalCode`: `String`
  - `country`: `String`
  - `contactPerson`: `String`
  - `phone`: `String`
  - `email`: `String`
  - `website`: `String`
  - `paymentTerms`: `String`
  - `leadTime`: `Int`
  - `rating`: `Float`
  - `status`: `String`
  - `notes`: `String`
- **`TransactionInput`**: Input untuk transaksi.
  - `transactionId`: `String`
  - `type`: `String!` (Wajib)
  - `materialId`: `ID!` (Wajib)
  - `quantity`: `Float!` (Wajib)
  - `unit`: `String!` (Wajib)
  - `transactionDate`: `String`
  - `supplierId`: `ID`
  - `referenceNumber`: `String`
  - `unitPrice`: `Float`
  - `totalPrice`: `Float`
  - `notes`: `String`
  - `createdBy`: `String`
- **`StockCheckInput`**: Input untuk cek stok.
  - `materialId`: `ID!` (Wajib)
  - `quantity`: `Float!` (Wajib)

#### Queries

- **`materials(category: String, type: String, status: String, supplierId: ID, lowStock: Boolean)`**: Mendapatkan semua material.
  - **Argumen:**
    - `category`: `String` (Opsional, filter kategori).
    - `type`: `String` (Opsional, filter tipe).
    - `status`: `String` (Opsional, filter status).
    - `supplierId`: `ID` (Opsional, filter ID pemasok).
    - `lowStock`: `Boolean` (Opsional, filter material dengan stok rendah).
  - **Output:** `[Material]` (Daftar objek Material).
- **`material(id: ID!)`**: Mendapatkan material berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik material).
  - **Output:** `Material` (Objek Material).
- **`materialById(materialId: String!)`**: Mendapatkan material berdasarkan ID material.
  - **Argumen:**
    - `materialId`: `String!` (Wajib, ID material unik).
  - **Output:** `Material` (Objek Material).
- **`materialCategories`**: Mendapatkan semua kategori material.
  - **Argumen:** Tidak ada.
  - **Output:** `[String]` (Daftar kategori material).
- **`materialTypes`**: Mendapatkan semua tipe material.
  - **Argumen:** Tidak ada.
  - **Output:** `[String]` (Daftar tipe material).
- **`suppliers(status: String)`**: Mendapatkan semua pemasok.
  - **Argumen:**
    - `status`: `String` (Opsional, filter status).
  - **Output:** `[Supplier]` (Daftar objek Supplier).
- **`supplier(id: ID!)`**: Mendapatkan pemasok berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pemasok).
  - **Output:** `Supplier` (Objek Supplier).
- **`supplierById(supplierId: String!)`**: Mendapatkan pemasok berdasarkan ID pemasok.
  - **Argumen:**
    - `supplierId`: `String!` (Wajib, ID pemasok unik).
  - **Output:** `Supplier` (Objek Supplier).
- **`supplierMaterials(id: ID!)`**: Mendapatkan material yang disediakan oleh pemasok tertentu.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pemasok).
  - **Output:** `[Material]` (Daftar objek Material).
- **`transactions(type: String, materialId: ID, supplierId: ID, startDate: String, endDate: String, limit: Int)`**: Mendapatkan semua transaksi material.
  - **Argumen:**
    - `type`: `String` (Opsional, filter tipe transaksi).
    - `materialId`: `ID` (Opsional, filter ID material).
    - `supplierId`: `ID` (Opsional, filter ID pemasok).
    - `startDate`: `String` (Opsional, tanggal mulai).
    - `endDate`: `String` (Opsional, tanggal akhir).
    - `limit`: `Int` (Opsional, batas jumlah hasil).
  - **Output:** `[MaterialTransaction]` (Daftar objek MaterialTransaction).
- **`transaction(id: ID!)`**: Mendapatkan transaksi berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik transaksi).
  - **Output:** `MaterialTransaction` (Objek MaterialTransaction).
- **`materialTransactionHistory(materialId: ID!)`**: Mendapatkan riwayat transaksi untuk material tertentu.
  - **Argumen:**
    - `materialId`: `ID!` (Wajib, ID unik material).
  - **Output:** `[MaterialTransaction]` (Daftar objek MaterialTransaction).
- **`stockReport(category: String, lowStock: Boolean)`**: Mendapatkan laporan stok material.
  - **Argumen:**
    - `category`: `String` (Opsional, filter kategori).
    - `lowStock`: `Boolean` (Opsional, filter stok rendah).
  - **Output:** `StockReport` (Objek StockReport).
- **`supplierPerformance(supplierId: ID)`**: Mendapatkan laporan kinerja pemasok.
  - **Argumen:**
    - `supplierId`: `ID` (Opsional, ID pemasok).
  - **Output:** `[SupplierPerformance]` (Daftar objek SupplierPerformance).
- **`checkStock(input: [StockCheckInput!]!)`**: Memeriksa ketersediaan stok material.
  - **Argumen:**
    - `input`: `[StockCheckInput!]!` (Wajib, daftar material dan jumlah yang diminta).
  - **Output:** `[StockCheckResult]` (Daftar hasil cek stok).

#### Mutations

- **`createMaterial(input: MaterialInput!)`**: Membuat material baru.
  - **Argumen:**
    - `input`: `MaterialInput!` (Wajib, data material baru).
  - **Output:** `Material` (Objek Material yang baru dibuat).
- **`updateMaterial(id: ID!, input: MaterialInput!)`**: Memperbarui material.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik material yang akan diperbarui).
    - `input`: `MaterialInput!` (Wajib, data material yang akan diperbarui).
  - **Output:** `Material` (Objek Material yang diperbarui).
- **`deleteMaterial(id: ID!)`**: Menghapus material.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik material yang akan dihapus).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).
- **`createSupplier(input: SupplierInput!)`**: Membuat pemasok baru.
  - **Argumen:**
    - `input`: `SupplierInput!` (Wajib, data pemasok baru).
  - **Output:** `Supplier` (Objek Supplier yang baru dibuat).
- **`updateSupplier(id: ID!, input: SupplierInput!)`**: Memperbarui pemasok.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pemasok yang akan diperbarui).
    - `input`: `SupplierInput!` (Wajib, data pemasok yang akan diperbarui).
  - **Output:** `Supplier` (Objek Supplier yang diperbarui).
- **`deleteSupplier(id: ID!)`**: Menghapus pemasok.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pemasok yang akan dihapus).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).
- **`receiveMaterial(input: TransactionInput!)`**: Membuat transaksi penerimaan material.
  - **Argumen:**
    - `input`: `TransactionInput!` (Wajib, data transaksi penerimaan).
  - **Output:** `MaterialTransaction` (Objek MaterialTransaction yang baru dibuat).
- **`issueMaterial(input: TransactionInput!)`**: Membuat transaksi pengeluaran material.
  - **Argumen:**
    - `input`: `TransactionInput!` (Wajib, data transaksi pengeluaran).
  - **Output:** `MaterialTransaction` (Objek MaterialTransaction yang baru dibuat).
- **`createStockAdjustment(input: TransactionInput!)`**: Membuat transaksi penyesuaian stok.
  - **Argumen:**
    - `input`: `TransactionInput!` (Wajib, data transaksi penyesuaian).
  - **Output:** `MaterialTransaction` (Objek MaterialTransaction yang baru dibuat).

### 3. Production Feedback Service

**Endpoint:** `http://localhost:5005/graphql`

#### Tipe Kustom

- **`ProductionStatus`**: Status produksi (`pending`, `in_production`, `on_hold`, `completed`, `cancelled`, `rejected`).
- **`StepStatus`**: Status langkah produksi (`pending`, `in_progress`, `completed`, `skipped`, `failed`).
- **`MachineCategory`**: Kategori mesin (`cutting`, `milling`, `drilling`, `turning`, `grinding`, `welding`, `assembly`, `inspection`, `packaging`, `other`).
- **`QualityResult`**: Hasil pemeriksaan kualitas (`pending`, `pass`, `fail`, `conditional_pass`, `needs_rework`).
- **`ImageType`**: Jenis gambar (`product`, `machine`, `defect`, `material`, `document`, `other`).
- **`CommentType`**: Jenis komentar (`internal`, `customer`, `marketplace`, `system`).
- **`NotificationType`**: Jenis notifikasi (`status_change`, `quality_issue`, `step_completion`, `comment`, `system`).
- **`NotificationPriority`**: Prioritas notifikasi (`low`, `medium`, `high`, `critical`).
- **`DeliveryMethod`**: Metode pengiriman notifikasi (`in_app`, `email`, `both`).
- **`ProductionFeedback`** (Feedback Produksi):
  - `id`: `ID!` (Wajib)
  - `feedbackId`: `String!` (Wajib)
  - `batchId`: `String!` (Wajib)
  - `orderId`: `String`
  - `productId`: `String`
  - `productName`: `String!` (Wajib)
  - `productionPlanId`: `String`
  - `status`: `ProductionStatus!` (Wajib)
  - `plannedQuantity`: `Int!` (Wajib)
  - `actualQuantity`: `Int`
  - `defectQuantity`: `Int`
  - `qualityScore`: `Float`
  - `startDate`: `String`
  - `endDate`: `String`
  - `isMarketplaceUpdated`: `Boolean!` (Wajib)
  - `marketplaceUpdateDate`: `String`
  - `notes`: `String`
  - `createdBy`: `String`
  - `updatedBy`: `String`
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)
  - `steps`: `[ProductionStep]` (Langkah-langkah produksi terkait)
  - `qualityChecks`: `[QualityCheck]` (Pemeriksaan kualitas terkait)
  - `images`: `[FeedbackImage]` (Gambar terkait)
  - `comments`: `[FeedbackComment]` (Komentar terkait)
  - `notifications`: `[FeedbackNotification]` (Notifikasi terkait)
- **`ProductionStep`** (Langkah Produksi):
  - `id`: `ID!` (Wajib)
  - `stepId`: `String!` (Wajib)
  - `feedbackId`: `String!` (Wajib)
  - `stepName`: `String!` (Wajib)
  - `stepOrder`: `Int!` (Wajib)
  - `machineId`: `String`
  - `machineName`: `String`
  - `machineCategory`: `MachineCategory`
  - `operatorId`: `String`
  - `operatorName`: `String`
  - `status`: `StepStatus!` (Wajib)
  - `startTime`: `String`
  - `endTime`: `String`
  - `duration`: `Int`
  - `plannedQuantity`: `Int!` (Wajib)
  - `actualQuantity`: `Int`
  - `defectQuantity`: `Int`
  - `notes`: `String`
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)
  - `feedback`: `ProductionFeedback`
  - `qualityChecks`: `[QualityCheck]`
  - `images`: `[FeedbackImage]`
- **`QualityCheck`** (Pemeriksaan Kualitas):
  - `id`: `ID!` (Wajib)
  - `checkId`: `String!` (Wajib)
  - `feedbackId`: `String!` (Wajib)
  - `stepId`: `String`
  - `checkName`: `String!` (Wajib)
  - `checkType`: `String!` (Wajib)
  - `checkDate`: `String!` (Wajib)
  - `inspectorId`: `String`
  - `inspectorName`: `String`
  - `result`: `QualityResult!` (Wajib)
  - `measurements`: `String`
  - `standardValue`: `String`
  - `actualValue`: `String`
  - `tolerance`: `String`
  - `deviationPercentage`: `Float`
  - `notes`: `String`
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)
  - `feedback`: `ProductionFeedback`
  - `step`: `ProductionStep`
  - `images`: `[FeedbackImage]`
- **`FeedbackImage`** (Gambar Feedback):
  - `id`: `ID!` (Wajib)
  - `imageId`: `String!` (Wajib)
  - `feedbackId`: `String!` (Wajib)
  - `stepId`: `String`
  - `qualityCheckId`: `String`
  - `imageType`: `ImageType!` (Wajib)
  - `title`: `String!` (Wajib)
  - `description`: `String`
  - `filePath`: `String!` (Wajib)
  - `fileUrl`: `String!` (Wajib)
  - `fileType`: `String!` (Wajib)
  - `fileSize`: `Int!` (Wajib)
  - `uploadedBy`: `String`
  - `uploadDate`: `String!` (Wajib)
  - `isPublic`: `Boolean!` (Wajib)
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)
  - `feedback`: `ProductionFeedback`
  - `step`: `ProductionStep`
  - `qualityCheck`: `QualityCheck`
- **`FeedbackComment`** (Komentar Feedback):
  - `id`: `ID!` (Wajib)
  - `commentId`: `String!` (Wajib)
  - `feedbackId`: `String!` (Wajib)
  - `commentType`: `CommentType!` (Wajib)
  - `content`: `String!` (Wajib)
  - `userId`: `String`
  - `userName`: `String`
  - `userRole`: `String`
  - `isImportant`: `Boolean!` (Wajib)
  - `parentCommentId`: `String`
  - `isEdited`: `Boolean!` (Wajib)
  - `isDeleted`: `Boolean!` (Wajib)
  - `visibleToCustomer`: `Boolean!` (Wajib)
  - `visibleToMarketplace`: `Boolean!` (Wajib)
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)
  - `feedback`: `ProductionFeedback`
  - `parentComment`: `FeedbackComment`
  - `replies`: `[FeedbackComment]`
- **`FeedbackNotification`** (Notifikasi Feedback):
  - `id`: `ID!` (Wajib)
  - `notificationId`: `String!` (Wajib)
  - `feedbackId`: `String!` (Wajib)
  - `type`: `NotificationType!` (Wajib)
  - `title`: `String!` (Wajib)
  - `message`: `String!` (Wajib)
  - `recipientType`: `String!` (Wajib)
  - `recipientId`: `String!` (Wajib)
  - `isRead`: `Boolean!` (Wajib)
  - `isDelivered`: `Boolean!` (Wajib)
  - `priority`: `NotificationPriority!` (Wajib)
  - `deliveryMethod`: `DeliveryMethod!` (Wajib)
  - `createdBy`: `String`
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)
  - `feedback`: `ProductionFeedback`
- **`PaginatedFeedback`** (Feedback dengan Paginasi):
  - `totalItems`: `Int!` (Wajib, Total item)
  - `totalPages`: `Int!` (Wajib, Total halaman)
  - `currentPage`: `Int!` (Wajib, Halaman saat ini)
  - `items`: `[ProductionFeedback]!` (Wajib, Daftar item feedback)
- **`ProductionSummary`** (Ringkasan Produksi):
  - `totalBatches`: `Int!` (Wajib)
  - `completedBatches`: `Int!` (Wajib)
  - `inProductionBatches`: `Int!` (Wajib)
  - `onHoldBatches`: `Int!` (Wajib)
  - `cancelledBatches`: `Int!` (Wajib)
  - `totalPlannedQuantity`: `Int!` (Wajib)
  - `totalActualQuantity`: `Int!` (Wajib)
  - `totalDefectQuantity`: `Int!` (Wajib)
  - `averageQualityScore`: `Float!` (Wajib)
  - `timeframe`: `String!` (Wajib)
- **`GenericResponse`** (Respons Generik):
  - `success`: `Boolean!` (Wajib, Status keberhasilan)
  - `message`: `String` (Pesan)
  - `id`: `ID` (ID terkait)

#### Tipe Input

- **`PaginationInput`**: Input untuk paginasi.
  - `page`: `Int` (Nomor halaman)
  - `limit`: `Int` (Batas jumlah item per halaman)
- **`FeedbackFilterInput`**: Filter untuk feedback.
  - `status`: `ProductionStatus`
  - `startDate`: `String`
  - `endDate`: `String`
  - `batchId`: `String`
  - `orderId`: `String`
  - `productId`: `String`
  - `productName`: `String`
- **`ProductionFeedbackInput`**: Input untuk ProductionFeedback.
  - `batchId`: `String!` (Wajib)
  - `orderId`: `String`
  - `productId`: `String`
  - `productName`: `String!` (Wajib)
  - `productionPlanId`: `String`
  - `status`: `ProductionStatus!` (Wajib)
  - `plannedQuantity`: `Int!` (Wajib)
  - `actualQuantity`: `Int`
  - `defectQuantity`: `Int`
  - `qualityScore`: `Float`
  - `startDate`: `String`
  - `endDate`: `String`
  - `notes`: `String`
- **`ProductionStepInput`**: Input untuk ProductionStep.
  - `feedbackId`: `String!` (Wajib)
  - `stepName`: `String!` (Wajib)
  - `stepOrder`: `Int!` (Wajib)
  - `machineId`: `String`
  - `machineName`: `String`
  - `machineCategory`: `MachineCategory`
  - `operatorId`: `String`
  - `operatorName`: `String`
  - `status`: `StepStatus!` (Wajib)
  - `startTime`: `String`
  - `endTime`: `String`
  - `plannedQuantity`: `Int!` (Wajib)
  - `actualQuantity`: `Int`
  - `defectQuantity`: `Int`
  - `notes`: `String`
- **`QualityCheckInput`**: Input untuk QualityCheck.
  - `feedbackId`: `String!` (Wajib)
  - `stepId`: `String`
  - `checkName`: `String!` (Wajib)
  - `checkType`: `String!` (Wajib)
  - `checkDate`: `String!` (Wajib)
  - `inspectorId`: `String`
  - `inspectorName`: `String`
  - `result`: `QualityResult!` (Wajib)
  - `measurements`: `String`
  - `standardValue`: `String`
  - `actualValue`: `String`
  - `tolerance`: `String`
  - `deviationPercentage`: `Float`
  - `notes`: `String`
- **`FeedbackCommentInput`**: Input untuk FeedbackComment.
  - `feedbackId`: `String!` (Wajib)
  - `commentType`: `CommentType!` (Wajib)
  - `content`: `String!` (Wajib)
  - `isImportant`: `Boolean`
  - `parentCommentId`: `String`
  - `visibleToCustomer`: `Boolean`
  - `visibleToMarketplace`: `Boolean`

#### Queries

- **`getFeedbackById(id: ID!)`**: Mendapatkan feedback berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik feedback).
  - **Output:** `ProductionFeedback` (Objek ProductionFeedback).
- **`getFeedbackByFeedbackId(feedbackId: String!)`**: Mendapatkan feedback berdasarkan feedback ID.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback unik).
  - **Output:** `ProductionFeedback` (Objek ProductionFeedback).
- **`getFeedbackByBatchId(batchId: String!)`**: Mendapatkan feedback berdasarkan batch ID.
  - **Argumen:**
    - `batchId`: `String!` (Wajib, ID batch).
  - **Output:** `ProductionFeedback` (Objek ProductionFeedback).
- **`getFeedbackByOrderId(orderId: String!)`**: Mendapatkan feedback berdasarkan order ID.
  - **Argumen:**
    - `orderId`: `String!` (Wajib, ID order).
  - **Output:** `ProductionFeedback` (Objek ProductionFeedback).
- **`getAllFeedback(pagination: PaginationInput, filters: FeedbackFilterInput)`**: Mendapatkan semua feedback dengan paginasi dan filter.
  - **Argumen:**
    - `pagination`: `PaginationInput` (Opsional, untuk paginasi).
    - `filters`: `FeedbackFilterInput` (Opsional, untuk filter).
  - **Output:** `PaginatedFeedback` (Objek PaginatedFeedback).
- **`getProductionSummary(timeframe: String)`**: Mendapatkan ringkasan produksi untuk rentang waktu tertentu.
  - **Argumen:**
    - `timeframe`: `String` (Opsional, misal "daily", "weekly", "monthly", "yearly").
  - **Output:** `ProductionSummary` (Objek ProductionSummary).
- **`getStepById(id: ID!)`**: Mendapatkan langkah produksi berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik langkah).
  - **Output:** `ProductionStep` (Objek ProductionStep).
- **`getStepByStepId(stepId: String!)`**: Mendapatkan langkah produksi berdasarkan step ID.
  - **Argumen:**
    - `stepId`: `String!` (Wajib, ID langkah unik).
  - **Output:** `ProductionStep` (Objek ProductionStep).
- **`getStepsByFeedbackId(feedbackId: String!)`**: Mendapatkan langkah-langkah produksi berdasarkan feedback ID.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback).
  - **Output:** `[ProductionStep]` (Daftar objek ProductionStep).
- **`getQualityCheckById(id: ID!)`**: Mendapatkan pemeriksaan kualitas berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pemeriksaan kualitas).
  - **Output:** `QualityCheck` (Objek QualityCheck).
- **`getQualityCheckByCheckId(checkId: String!)`**: Mendapatkan pemeriksaan kualitas berdasarkan check ID.
  - **Argumen:**
    - `checkId`: `String!` (Wajib, ID pemeriksaan kualitas unik).
  - **Output:** `QualityCheck` (Objek QualityCheck).
- **`getQualityChecksByFeedbackId(feedbackId: String!)`**: Mendapatkan pemeriksaan kualitas berdasarkan feedback ID.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback).
  - **Output:** `[QualityCheck]` (Daftar objek QualityCheck).
- **`getQualityChecksByStepId(stepId: String!)`**: Mendapatkan pemeriksaan kualitas berdasarkan step ID.
  - **Argumen:**
    - `stepId`: `String!` (Wajib, ID langkah produksi).
  - **Output:** `[QualityCheck]` (Daftar objek QualityCheck).
- **`getQualitySummary(feedbackId: String!)`**: Mendapatkan ringkasan kualitas untuk feedback tertentu.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback).
  - **Output:** `QualityCheck` (Objek QualityCheck - mungkin ini harusnya tipe `QualitySummary` tersendiri).
- **`getImageById(id: ID!)`**: Mendapatkan gambar feedback berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik gambar).
  - **Output:** `FeedbackImage` (Objek FeedbackImage).
- **`getImageByImageId(imageId: String!)`**: Mendapatkan gambar feedback berdasarkan image ID.
  - **Argumen:**
    - `imageId`: `String!` (Wajib, ID gambar unik).
  - **Output:** `FeedbackImage` (Objek FeedbackImage).
- **`getImagesByFeedbackId(feedbackId: String!)`**: Mendapatkan gambar feedback berdasarkan feedback ID.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback).
  - **Output:** `[FeedbackImage]` (Daftar objek FeedbackImage).
- **`getImagesByStepId(stepId: String!)`**: Mendapatkan gambar feedback berdasarkan step ID.
  - **Argumen:**
    - `stepId`: `String!` (Wajib, ID langkah produksi).
  - **Output:** `[FeedbackImage]` (Daftar objek FeedbackImage).
- **`getImagesByQualityCheckId(qualityCheckId: String!)`**: Mendapatkan gambar feedback berdasarkan quality check ID.
  - **Argumen:**
    - `qualityCheckId`: `String!` (Wajib, ID pemeriksaan kualitas).
  - **Output:** `[FeedbackImage]` (Daftar objek FeedbackImage).
- **`getPublicImages(feedbackId: String!)`**: Mendapatkan gambar publik berdasarkan feedback ID.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback).
  - **Output:** `[FeedbackImage]` (Daftar objek FeedbackImage).
- **`getCommentById(id: ID!)`**: Mendapatkan komentar berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik komentar).
  - **Output:** `FeedbackComment` (Objek FeedbackComment).
- **`getCommentsByFeedbackId(feedbackId: String!)`**: Mendapatkan komentar berdasarkan feedback ID.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback).
  - **Output:** `[FeedbackComment]` (Daftar objek FeedbackComment).
- **`getCommentReplies(parentCommentId: String!)`**: Mendapatkan balasan komentar berdasarkan ID komentar induk.
  - **Argumen:**
    - `parentCommentId`: `String!` (Wajib, ID komentar induk).
  - **Output:** `[FeedbackComment]` (Daftar objek FeedbackComment).
- **`getPublicComments(feedbackId: String!)`**: Mendapatkan komentar publik berdasarkan feedback ID.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback).
  - **Output:** `[FeedbackComment]` (Daftar objek FeedbackComment).
- **`getCustomerComments(feedbackId: String!)`**: Mendapatkan komentar pelanggan berdasarkan feedback ID.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback).
  - **Output:** `[FeedbackComment]` (Daftar objek FeedbackComment).
- **`getNotificationById(notificationId: String!)`**: Mendapatkan notifikasi berdasarkan ID notifikasi.
  - **Argumen:**
    - `notificationId`: `String!` (Wajib, ID notifikasi unik).
  - **Output:** `FeedbackNotification` (Objek FeedbackNotification).
- **`getNotificationsByFeedbackId(feedbackId: String!)`**: Mendapatkan notifikasi berdasarkan feedback ID.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback).
  - **Output:** `[FeedbackNotification]` (Daftar objek FeedbackNotification).
- **`getNotificationsByRecipient(recipientType: String!, recipientId: String!)`**: Mendapatkan notifikasi berdasarkan tipe dan ID penerima.
  - **Argumen:**
    - `recipientType`: `String!` (Wajib, Tipe penerima).
    - `recipientId`: `String!` (Wajib, ID penerima).
  - **Output:** `[FeedbackNotification]` (Daftar objek FeedbackNotification).
- **`getUnreadNotificationCount(recipientType: String!, recipientId: String!)`**: Mendapatkan jumlah notifikasi yang belum dibaca.
  - **Argumen:**
    - `recipientType`: `String!` (Wajib, Tipe penerima).
    - `recipientId`: `String!` (Wajib, ID penerima).
  - **Output:** `Int` (Jumlah notifikasi belum dibaca).

#### Mutations

- **`createFeedback(input: ProductionFeedbackInput!)`**: Membuat feedback baru.
  - **Argumen:**
    - `input`: `ProductionFeedbackInput!` (Wajib, data feedback baru).
  - **Output:** `ProductionFeedback` (Objek ProductionFeedback yang baru dibuat).
- **`updateFeedback(id: ID!, input: ProductionFeedbackInput!)`**: Memperbarui feedback.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik feedback yang akan diperbarui).
    - `input`: `ProductionFeedbackInput!` (Wajib, data feedback yang akan diperbarui).
  - **Output:** `ProductionFeedback` (Objek ProductionFeedback yang diperbarui).
- **`updateFeedbackStatus(id: ID!, status: ProductionStatus!)`**: Memperbarui status feedback.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik feedback).
    - `status`: `ProductionStatus!` (Wajib, status baru).
  - **Output:** `ProductionFeedback` (Objek ProductionFeedback yang diperbarui).
- **`updateFeedbackQuantities(id: ID!, actualQuantity: Int, defectQuantity: Int)`**: Memperbarui jumlah aktual dan cacat pada feedback.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik feedback).
    - `actualQuantity`: `Int` (Opsional, jumlah aktual).
    - `defectQuantity`: `Int` (Opsional, jumlah cacat).
  - **Output:** `ProductionFeedback` (Objek ProductionFeedback yang diperbarui).
- **`deleteFeedback(id: ID!)`**: Menghapus feedback.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik feedback).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).
- **`sendMarketplaceUpdate(feedbackId: String!)`**: Mengirim pembaruan ke marketplace.
  - **Argumen:**
    - `feedbackId`: `String!` (Wajib, ID feedback).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).
- **`createStep(input: ProductionStepInput!)`**: Membuat langkah produksi baru.
  - **Argumen:**
    - `input`: `ProductionStepInput!` (Wajib, data langkah produksi baru).
  - **Output:** `ProductionStep` (Objek ProductionStep yang baru dibuat).
- **`createBatchSteps(steps: [ProductionStepInput!]!)`**: Membuat beberapa langkah produksi dalam satu batch.
  - **Argumen:**
    - `steps`: `[ProductionStepInput!]!` (Wajib, daftar data langkah produksi).
  - **Output:** `[ProductionStep]` (Daftar objek ProductionStep yang baru dibuat).
- **`updateStep(id: ID!, input: ProductionStepInput!)`**: Memperbarui langkah produksi.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik langkah produksi).
    - `input`: `ProductionStepInput!` (Wajib, data langkah produksi yang akan diperbarui).
  - **Output:** `ProductionStep` (Objek ProductionStep yang diperbarui).
- **`updateStepStatus(id: ID!, status: StepStatus!)`**: Memperbarui status langkah produksi.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik langkah produksi).
    - `status`: `StepStatus!` (Wajib, status baru).
  - **Output:** `ProductionStep` (Objek ProductionStep yang diperbarui).
- **`updateStepTiming(id: ID!, startTime: String, endTime: String)`**: Memperbarui waktu mulai dan selesai langkah produksi.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik langkah produksi).
    - `startTime`: `String` (Opsional, waktu mulai).
    - `endTime`: `String` (Opsional, waktu selesai).
  - **Output:** `ProductionStep` (Objek ProductionStep yang diperbarui).
- **`deleteStep(id: ID!)`**: Menghapus langkah produksi.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik langkah produksi).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).
- **`createQualityCheck(input: QualityCheckInput!)`**: Membuat pemeriksaan kualitas baru.
  - **Argumen:**
    - `input`: `QualityCheckInput!` (Wajib, data pemeriksaan kualitas baru).
  - **Output:** `QualityCheck` (Objek QualityCheck yang baru dibuat).
- **`createBatchQualityChecks(checks: [QualityCheckInput!]!)`**: Membuat beberapa pemeriksaan kualitas dalam satu batch.
  - **Argumen:**
    - `checks`: `[QualityCheckInput!]!` (Wajib, daftar data pemeriksaan kualitas).
  - **Output:** `[QualityCheck]` (Daftar objek QualityCheck yang baru dibuat).
- **`updateQualityCheck(id: ID!, input: QualityCheckInput!)`**: Memperbarui pemeriksaan kualitas.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pemeriksaan kualitas).
    - `input`: `QualityCheckInput!` (Wajib, data pemeriksaan kualitas yang akan diperbarui).
  - **Output:** `QualityCheck` (Objek QualityCheck yang diperbarui).
- **`updateQualityResult(id: ID!, result: QualityResult!, notes: String)`**: Memperbarui hasil pemeriksaan kualitas.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pemeriksaan kualitas).
    - `result`: `QualityResult!` (Wajib, hasil baru).
    - `notes`: `String` (Opsional, catatan).
  - **Output:** `QualityCheck` (Objek QualityCheck yang diperbarui).
- **`deleteQualityCheck(id: ID!)`**: Menghapus pemeriksaan kualitas.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pemeriksaan kualitas).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).
- **`createComment(input: FeedbackCommentInput!)`**: Membuat komentar baru.
  - **Argumen:**
    - `input`: `FeedbackCommentInput!` (Wajib, data komentar baru).
  - **Output:** `FeedbackComment` (Objek FeedbackComment yang baru dibuat).
- **`updateComment(id: ID!, content: String!, isImportant: Boolean, visibleToCustomer: Boolean, visibleToMarketplace: Boolean)`**: Memperbarui komentar.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik komentar).
    - `content`: `String!` (Wajib, konten komentar baru).
    - `isImportant`: `Boolean` (Opsional, apakah penting).
    - `visibleToCustomer`: `Boolean` (Opsional, terlihat oleh pelanggan).
    - `visibleToMarketplace`: `Boolean` (Opsional, terlihat di marketplace).
  - **Output:** `FeedbackComment` (Objek FeedbackComment yang diperbarui).
- **`deleteComment(id: ID!)`**: Menghapus komentar.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik komentar).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).
- **`markNotificationAsRead(notificationId: String!)`**: Menandai notifikasi sebagai sudah dibaca.
  - **Argumen:**
    - `notificationId`: `String!` (Wajib, ID notifikasi unik).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).
- **`markMultipleNotificationsAsRead(notificationIds: [String!]!)`**: Menandai beberapa notifikasi sebagai sudah dibaca.
  - **Argumen:**
    - `notificationIds`: `[String!]!` (Wajib, daftar ID notifikasi).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).
- **`sendEmailNotification(notificationId: String!)`**: Mengirim notifikasi melalui email.
  - **Argumen:**
    - `notificationId`: `String!` (Wajib, ID notifikasi unik).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).
- **`deleteNotification(notificationId: String!)`**: Menghapus notifikasi.
  - **Argumen:**
    - `notificationId`: `String!` (Wajib, ID notifikasi unik).
  - **Output:** `GenericResponse` (Respons generik keberhasilan).

### 4. Production Management Service

**Endpoint:** `http://localhost:5001/graphql`

#### Tipe Kustom

- **`RequestStatus`**: Status permintaan (`received`, `planned`, `in_production`, `completed`, `cancelled`).
- **`BatchStatus`**: Status batch (`pending`, `scheduled`, `in_progress`, `completed`, `cancelled`).
- **`StepStatus`**: Status langkah (`pending`, `scheduled`, `in_progress`, `completed`, `cancelled`).
- **`MaterialStatus`**: Status material (`pending`, `partial`, `allocated`, `consumed`).
- **`Priority`**: Prioritas (`low`, `normal`, `high`, `urgent`).
- **`ProductionRequest`** (Permintaan Produksi):
  - `id`: `ID!` (Wajib)
  - `requestId`: `String!` (Wajib)
  - `customerId`: `String!` (Wajib)
  - `productName`: `String!` (Wajib)
  - `quantity`: `Int!` (Wajib)
  - `priority`: `Priority!` (Wajib)
  - `dueDate`: `String!` (Wajib)
  - `specifications`: `String`
  - `status`: `RequestStatus!` (Wajib)
  - `marketplaceData`: `String`
  - `batches`: `[ProductionBatch]`
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)
- **`ProductionBatch`** (Batch Produksi):
  - `id`: `ID!` (Wajib)
  - `batchNumber`: `String!` (Wajib)
  - `requestId`: `Int!` (Wajib)
  - `scheduledStartDate`: `String`
  - `scheduledEndDate`: `String`
  - `actualStartDate`: `String`
  - `actualEndDate`: `String`
  - `quantity`: `Int!` (Wajib)
  - `status`: `BatchStatus!` (Wajib)
  - `materialsAssigned`: `Boolean!` (Wajib)
  - `machineAssigned`: `Boolean!` (Wajib)
  - `notes`: `String`
  - `request`: `ProductionRequest`
  - `steps`: `[ProductionStep]`
  - `materialAllocations`: `[MaterialAllocation]`
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)
- **`ProductionStep`** (Langkah Produksi):
  - `id`: `ID!` (Wajib)
  - `batchId`: `Int!` (Wajib)
  - `stepName`: `String!` (Wajib)
  - `stepOrder`: `Int!` (Wajib)
  - `machineType`: `String`
  - `scheduledStartTime`: `String`
  - `scheduledEndTime`: `String`
  - `actualStartTime`: `String`
  - `actualEndTime`: `String`
  - `machineId`: `Int`
  - `operatorId`: `Int`
  - `status`: `StepStatus!` (Wajib)
  - `notes`: `String`
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)
  - `feedback`: `ProductionFeedback`
  - `qualityChecks`: `[QualityCheck]`
  - `images`: `[FeedbackImage]`
- **`MaterialAllocation`** (Alokasi Material):
  - `id`: `ID!` (Wajib)
  - `batchId`: `Int!` (Wajib)
  - `materialId`: `Int!` (Wajib)
  - `quantityRequired`: `Float!` (Wajib)
  - `quantityAllocated`: `Float!` (Wajib)
  - `unitOfMeasure`: `String!` (Wajib)
  - `status`: `MaterialStatus!` (Wajib)
  - `allocationDate`: `String`
  - `notes`: `String`
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)

#### Tipe Input

- **`ProductionRequestInput`**: Input untuk permintaan produksi baru.
  - `requestId`: `String!` (Wajib)
  - `customerId`: `String!` (Wajib)
  - `productName`: `String!` (Wajib)
  - `quantity`: `Int!` (Wajib)
  - `priority`: `Priority!` (Wajib)
  - `dueDate`: `String!` (Wajib)
  - `specifications`: `String`
  - `marketplaceData`: `String`
- **`ProductionRequestUpdateInput`**: Input untuk memperbarui permintaan produksi.
  - `customerId`: `String`
  - `productName`: `String`
  - `quantity`: `Int`
  - `priority`: `Priority`
  - `dueDate`: `String`
  - `specifications`: `String`
  - `status`: `RequestStatus`
  - `marketplaceData`: `String`
- **`ProductionStepInput`**: Input untuk langkah produksi.
  - `stepName`: `String!` (Wajib)
  - `machineType`: `String`
  - `scheduledStartTime`: `String`
  - `scheduledEndTime`: `String`
- **`MaterialInput`**: Input untuk material dalam batch.
  - `materialId`: `Int!` (Wajib)
  - `quantityRequired`: `Float!` (Wajib)
  - `unitOfMeasure`: `String!` (Wajib)
- **`ProductionBatchInput`**: Input untuk batch produksi baru.
  - `requestId`: `Int!` (Wajib)
  - `quantity`: `Int!` (Wajib)
  - `scheduledStartDate`: `String`
  - `scheduledEndDate`: `String`
  - `notes`: `String`
  - `steps`: `[ProductionStepInput]` (Daftar langkah produksi)
  - `materials`: `[MaterialInput]` (Daftar material yang dibutuhkan)
- **`ProductionBatchUpdateInput`**: Input untuk memperbarui batch produksi.
  - `scheduledStartDate`: `String`
  - `scheduledEndDate`: `String`
  - `actualStartDate`: `String`
  - `actualEndDate`: `String`
  - `status`: `BatchStatus`
  - `notes`: `String`
- **`ProductionStepUpdateInput`**: Input untuk memperbarui langkah produksi.
  - `machineId`: `Int`
  - `operatorId`: `Int`
  - `actualStartTime`: `String`
  - `actualEndTime`: `String`
  - `status`: `StepStatus`
  - `notes`: `String`

#### Queries

- **`productionRequests`**: Mendapatkan semua permintaan produksi.
  - **Argumen:** Tidak ada.
  - **Output:** `[ProductionRequest]` (Daftar objek ProductionRequest).
- **`productionRequest(id: ID!)`**: Mendapatkan permintaan produksi berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik permintaan produksi).
  - **Output:** `ProductionRequest` (Objek ProductionRequest).
- **`productionRequestsByStatus(status: RequestStatus!)`**: Mendapatkan permintaan produksi berdasarkan status.
  - **Argumen:**
    - `status`: `RequestStatus!` (Wajib, status permintaan).
  - **Output:** `[ProductionRequest]` (Daftar objek ProductionRequest).
- **`productionBatches`**: Mendapatkan semua batch produksi.
  - **Argumen:** Tidak ada.
  - **Output:** `[ProductionBatch]` (Daftar objek ProductionBatch).
- **`productionBatch(id: ID!)`**: Mendapatkan batch produksi berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik batch produksi).
  - **Output:** `ProductionBatch` (Objek ProductionBatch).
- **`productionBatchesByRequest(requestId: ID!)`**: Mendapatkan batch produksi berdasarkan ID permintaan.
  - **Argumen:**
    - `requestId`: `ID!` (Wajib, ID permintaan produksi).
  - **Output:** `[ProductionBatch]` (Daftar objek ProductionBatch).
- **`productionBatchesByStatus(status: BatchStatus!)`**: Mendapatkan batch produksi berdasarkan status.
  - **Argumen:**
    - `status`: `BatchStatus!` (Wajib, status batch).
  - **Output:** `[ProductionBatch]` (Daftar objek ProductionBatch).
- **`productionStepsByBatch(batchId: ID!)`**: Mendapatkan langkah-langkah produksi berdasarkan ID batch.
  - **Argumen:**
    - `batchId`: `ID!` (Wajib, ID batch produksi).
  - **Output:** `[ProductionStep]` (Daftar objek ProductionStep).
- **`productionStep(id: ID!)`**: Mendapatkan langkah produksi berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik langkah produksi).
  - **Output:** `ProductionStep` (Objek ProductionStep).
- **`materialAllocationsByBatch(batchId: ID!)`**: Mendapatkan alokasi material berdasarkan ID batch.
  - **Argumen:**
    - `batchId`: `ID!` (Wajib, ID batch produksi).
  - **Output:** `[MaterialAllocation]` (Daftar objek MaterialAllocation).

#### Mutations

- **`createProductionRequest(input: ProductionRequestInput!)`**: Membuat permintaan produksi baru.
  - **Argumen:**
    - `input`: `ProductionRequestInput!` (Wajib, data permintaan produksi baru).
  - **Output:** `ProductionRequest` (Objek ProductionRequest yang baru dibuat).
- **`updateProductionRequest(id: ID!, input: ProductionRequestUpdateInput!)`**: Memperbarui permintaan produksi.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik permintaan produksi).
    - `input`: `ProductionRequestUpdateInput!` (Wajib, data permintaan produksi yang akan diperbarui).
  - **Output:** `ProductionRequest` (Objek ProductionRequest yang diperbarui).
- **`cancelProductionRequest(id: ID!)`**: Membatalkan permintaan produksi.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik permintaan produksi).
  - **Output:** `ProductionRequest` (Objek ProductionRequest yang dibatalkan).
- **`createProductionBatch(input: ProductionBatchInput!)`**: Membuat batch produksi baru.
  - **Argumen:**
    - `input`: `ProductionBatchInput!` (Wajib, data batch produksi baru).
  - **Output:** `ProductionBatch` (Objek ProductionBatch yang baru dibuat).
- **`updateProductionBatch(id: ID!, input: ProductionBatchUpdateInput!)`**: Memperbarui batch produksi.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik batch produksi).
    - `input`: `ProductionBatchUpdateInput!` (Wajib, data batch produksi yang akan diperbarui).
  - **Output:** `ProductionBatch` (Objek ProductionBatch yang diperbarui).
- **`updateProductionStep(id: ID!, input: ProductionStepUpdateInput!)`**: Memperbarui langkah produksi.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik langkah produksi).
    - `input`: `ProductionStepUpdateInput!` (Wajib, data langkah produksi yang akan diperbarui).
  - **Output:** `ProductionStep` (Objek ProductionStep yang diperbarui).

### 5. Production Planning Service

**Endpoint:** `http://localhost:5002/graphql`

#### Tipe Kustom

- **`SuccessResponse`** (Respons Keberhasilan):
  - `success`: `Boolean`
  - `message`: `String`
- **`ApproveResponse`** (Respons Persetujuan):
  - `success`: `Boolean`
  - `message`: `String`
  - `plan`: `ProductionPlan`
  - `batchCreated`: `BatchResponse`
- **`BatchResponse`** (Respons Batch):
  - `id`: `Int`
  - `batchNumber`: `String`
- **`ProductionPlan`** (Rencana Produksi):
  - `id`: `ID`
  - `planId`: `String`
  - `requestId`: `Int`
  - `productionRequestId`: `String`
  - `productName`: `String`
  - `plannedStartDate`: `String`
  - `plannedEndDate`: `String`
  - `priority`: `String`
  - `status`: `String`
  - `planningNotes`: `String`
  - `totalCapacityRequired`: `Float`
  - `totalMaterialCost`: `Float`
  - `plannedBatches`: `Int`
  - `approvedBy`: `String`
  - `approvalDate`: `String`
  - `createdAt`: `String`
  - `updatedAt`: `String`
  - `capacityPlans`: `[CapacityPlan]`
  - `materialPlans`: `[MaterialPlan]`
- **`CapacityPlan`** (Rencana Kapasitas):
  - `id`: `ID`
  - `planId`: `Int`
  - `machineType`: `String`
  - `hoursRequired`: `Float`
  - `startDate`: `String`
  - `endDate`: `String`
  - `plannedMachineId`: `Int`
  - `status`: `String`
  - `notes`: `String`
  - `createdAt`: `String`
  - `updatedAt`: `String`
- **`MaterialPlan`** (Rencana Material):
  - `id`: `ID`
  - `planId`: `Int`
  - `materialId`: `Int`
  - `materialName`: `String`
  - `quantityRequired`: `Float`
  - `unitOfMeasure`: `String`
  - `unitCost`: `Float`
  - `totalCost`: `Float`
  - `status`: `String`
  - `availabilityChecked`: `Boolean`
  - `availabilityDate`: `String`
  - `notes`: `String`
  - `createdAt`: `String`
  - `updatedAt`: `String`

#### Tipe Input

- **`PlanInput`**: Input untuk membuat rencana baru.
  - `requestId`: `Int!` (Wajib)
  - `productName`: `String!` (Wajib)
  - `plannedStartDate`: `String`
  - `plannedEndDate`: `String`
  - `priority`: `String`
  - `planningNotes`: `String`
- **`PlanUpdateInput`**: Input untuk memperbarui rencana.
  - `productName`: `String`
  - `plannedStartDate`: `String`
  - `plannedEndDate`: `String`
  - `priority`: `String`
  - `status`: `String`
  - `planningNotes`: `String`
  - `totalCapacityRequired`: `Float`
  - `totalMaterialCost`: `Float`
  - `plannedBatches`: `Int`
  - `requestId`: `Int`
- **`CapacityPlanInput`**: Input untuk rencana kapasitas.
  - `machineType`: `String!` (Wajib)
  - `hoursRequired`: `Float!` (Wajib)
  - `startDate`: `String`
  - `endDate`: `String`
  - `plannedMachineId`: `Int`
  - `notes`: `String`
- **`CapacityPlanUpdateInput`**: Input untuk memperbarui rencana kapasitas.
  - `machineType`: `String`
  - `hoursRequired`: `Float`
  - `startDate`: `String`
  - `endDate`: `String`
  - `plannedMachineId`: `Int`
  - `notes`: `String`
  - `status`: `String`
- **`MaterialPlanInput`**: Input untuk rencana material.
  - `materialId`: `Int!` (Wajib)
  - `materialName`: `String!` (Wajib)
  - `quantityRequired`: `Float!` (Wajib)
  - `unitOfMeasure`: `String!` (Wajib)
  - `unitCost`: `Float`
  - `notes`: `String`
- **`MaterialPlanUpdateInput`**: Input untuk memperbarui rencana material.
  - `materialId`: `Int`
  - `materialName`: `String`
  - `quantityRequired`: `Float`
  - `unitOfMeasure`: `String`
  - `unitCost`: `Float`
  - `notes`: `String`
  - `status`: `String`
  - `availabilityChecked`: `Boolean`
  - `availabilityDate`: `String`

#### Queries

- **`plans`**: Mendapatkan semua rencana produksi.
  - **Argumen:** Tidak ada.
  - **Output:** `[ProductionPlan]` (Daftar objek ProductionPlan).
- **`plan(id: ID!)`**: Mendapatkan rencana produksi berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik rencana produksi).
  - **Output:** `ProductionPlan` (Objek ProductionPlan).
- **`capacityPlans(planId: ID!)`**: Mendapatkan semua rencana kapasitas untuk rencana produksi tertentu.
  - **Argumen:**
    - `planId`: `ID!` (Wajib, ID rencana produksi).
  - **Output:** `[CapacityPlan]` (Daftar objek CapacityPlan).
- **`capacityPlan(id: ID!)`**: Mendapatkan rencana kapasitas berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik rencana kapasitas).
  - **Output:** `CapacityPlan` (Objek CapacityPlan).
- **`materialPlans(planId: ID!)`**: Mendapatkan semua rencana material untuk rencana produksi tertentu.
  - **Argumen:**
    - `planId`: `ID!` (Wajib, ID rencana produksi).
  - **Output:** `[MaterialPlan]` (Daftar objek MaterialPlan).

#### Mutations

- **`createPlan(input: PlanInput)`**: Membuat rencana produksi baru.
  - **Argumen:**
    - `input`: `PlanInput` (Opsional, data rencana produksi baru).
  - **Output:** `ProductionPlan` (Objek ProductionPlan yang baru dibuat).
- **`updatePlan(id: ID!, input: PlanUpdateInput)`**: Memperbarui rencana produksi.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik rencana produksi).
    - `input`: `PlanUpdateInput` (Opsional, data rencana produksi yang akan diperbarui).
  - **Output:** `ProductionPlan` (Objek ProductionPlan yang diperbarui).
- **`deletePlan(id: ID!)`**: Menghapus rencana produksi.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik rencana produksi).
  - **Output:** `SuccessResponse` (Respons keberhasilan).
- **`approvePlan(id: ID!, approvedBy: String!, notes: String)`**: Menyetujui rencana produksi dan membuat batch terkait.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik rencana produksi).
    - `approvedBy`: `String!` (Wajib, nama atau ID yang menyetujui).
    - `notes`: `String` (Opsional, catatan persetujuan).
  - **Output:** `ApproveResponse` (Respons persetujuan dengan detail batch yang dibuat).
- **`addCapacityPlan(planId: ID!, input: CapacityPlanInput)`**: Menambahkan rencana kapasitas ke rencana produksi.
  - **Argumen:**
    - `planId`: `ID!` (Wajib, ID rencana produksi).
    - `input`: `CapacityPlanInput` (Opsional, data rencana kapasitas baru).
  - **Output:** `CapacityPlan` (Objek CapacityPlan yang baru dibuat).
- **`updateCapacityPlan(id: ID!, input: CapacityPlanUpdateInput)`**: Memperbarui rencana kapasitas.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik rencana kapasitas).
    - `input`: `CapacityPlanUpdateInput` (Opsional, data rencana kapasitas yang akan diperbarui).
  - **Output:** `CapacityPlan` (Objek CapacityPlan yang diperbarui).
- **`deleteCapacityPlan(id: ID!)`**: Menghapus rencana kapasitas.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik rencana kapasitas).
  - **Output:** `SuccessResponse` (Respons keberhasilan).
- **`addMaterialPlan(planId: ID!, input: MaterialPlanInput)`**: Menambahkan rencana material ke rencana produksi.
  - **Argumen:**
    - `planId`: `ID!` (Wajib, ID rencana produksi).
    - `input`: `MaterialPlanInput` (Opsional, data rencana material baru).
  - **Output:** `MaterialPlan` (Objek MaterialPlan yang baru dibuat).
- **`updateMaterialPlan(id: ID!, input: MaterialPlanUpdateInput)`**: Memperbarui rencana material.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik rencana material).
    - `input`: `MaterialPlanUpdateInput` (Opsional, data rencana material yang akan diperbarui).
  - **Output:** `MaterialPlan` (Objek MaterialPlan yang diperbarui).
- **`deleteMaterialPlan(id: ID!)`**: Menghapus rencana material.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik rencana material).
  - **Output:** `SuccessResponse` (Respons keberhasilan).

### 6. User Service

**Endpoint:** `http://localhost:5006/graphql`

#### Tipe Kustom

- **`User`** (Pengguna):
  - `id`: `ID!` (Wajib)
  - `username`: `String!` (Wajib)
  - `email`: `String!` (Wajib)
  - `fullName`: `String`
  - `role`: `String!` (Wajib)
  - `status`: `String!` (Wajib)
  - `lastLogin`: `String`
  - `createdAt`: `String!` (Wajib)
  - `updatedAt`: `String!` (Wajib)
- **`AuthResponse`** (Respons Otentikasi):
  - `token`: `String!` (Wajib)
  - `user`: `User!` (Wajib)
- **`VerifyResponse`** (Respons Verifikasi):
  - `valid`: `Boolean!` (Wajib)
  - `user`: `User`
  - `message`: `String`

#### Queries

- **`users`**: Mendapatkan semua pengguna.
  - **Argumen:** Tidak ada.
  - **Output:** `[User!]!` (Daftar objek User).
- **`user(id: ID!)`**: Mendapatkan pengguna berdasarkan ID.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pengguna).
  - **Output:** `User` (Objek User).
- **`currentUser`**: Mendapatkan informasi pengguna yang sedang login.
  - **Argumen:** Tidak ada.
  - **Output:** `User` (Objek User).

#### Mutations

- **`login(username: String!, password: String!)`**: Melakukan login pengguna.
  - **Argumen:**
    - `username`: `String!` (Wajib, nama pengguna).
    - `password`: `String!` (Wajib, kata sandi).
  - **Output:** `AuthResponse` (Objek AuthResponse dengan token dan data pengguna).
- **`register(username: String!, email: String!, password: String!, fullName: String, role: String)`**: Mendaftarkan pengguna baru.
  - **Argumen:**
    - `username`: `String!` (Wajib, nama pengguna).
    - `email`: `String!` (Wajib, email).
    - `password`: `String!` (Wajib, kata sandi).
    - `fullName`: `String` (Opsional, nama lengkap).
    - `role`: `String` (Opsional, peran pengguna. Default: "user").
  - **Output:** `AuthResponse` (Objek AuthResponse dengan token dan data pengguna).
- **`updateUser(id: ID!, username: String, email: String, password: String, fullName: String, role: String, status: String)`**: Memperbarui informasi pengguna.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pengguna yang akan diperbarui).
    - `username`: `String` (Opsional, nama pengguna baru).
    - `email`: `String` (Opsional, email baru).
    - `password`: `String` (Opsional, kata sandi baru).
    - `fullName`: `String` (Opsional, nama lengkap baru).
    - `role`: `String` (Opsional, peran baru).
    - `status`: `String` (Opsional, status baru).
  - **Output:** `User` (Objek User yang diperbarui).
- **`deleteUser(id: ID!)`**: Menghapus pengguna.
  - **Argumen:**
    - `id`: `ID!` (Wajib, ID unik pengguna yang akan dihapus).
  - **Output:** `Boolean` (True jika berhasil dihapus, false jika gagal).
- **`verifyToken(token: String!)`**: Memverifikasi token autentikasi.
  - **Argumen:**
    - `token`: `String!` (Wajib, token JWT).
  - **Output:** `VerifyResponse` (Objek VerifyResponse yang menunjukkan validitas token dan data pengguna).
