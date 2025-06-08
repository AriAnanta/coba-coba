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

### 3. Konfigurasi Environment

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

Port default untuk setiap layanan:

- User Service: 5006
- Production Management: 5001
- Production Planning: 5002
- Machine Queue: 5003
- Material Inventory: 5004
- Production Feedback: 5005

### 4. Inisialisasi Database

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

### 2. Menjalankan Layanan Tertentu

Untuk menjalankan layanan tertentu secara terpisah:

```bash
# Contoh untuk Production Feedback Service
cd production_feedback
npm run start

# Atau dengan nodemon untuk development
npm run dev
```

### 3. Memastikan Semua Layanan Berjalan

Setelah menjalankan semua layanan, pastikan semua layanan berjalan dengan memeriksa endpoint health check:

```
http://localhost:5006/health  # User Service
http://localhost:5001/health  # Production Management
http://localhost:5002/health  # Production Planning
http://localhost:5003/health  # Machine Queue
http://localhost:5004/health  # Material Inventory
http://localhost:5005/health  # Production Feedback
```

## Dokumentasi Lengkap GraphQL API

Berikut adalah dokumentasi lengkap untuk semua layanan yang mengekspos API GraphQL. Setiap layanan memiliki endpoint GraphQL yang dapat diakses untuk melakukan operasi data.

### 🔐 1. User Service - Manajemen Pengguna dan Autentikasi

**Endpoint:** `http://localhost:5006/graphql`

#### Tipe Data Utama

**User** - Informasi pengguna
```graphql
type User {
  id: ID!              # ID unik pengguna
  username: String!    # Nama pengguna (wajib)
  email: String!       # Email pengguna (wajib)
  fullName: String     # Nama lengkap
  role: String!        # Peran pengguna (wajib)
  status: String!      # Status pengguna (aktif/nonaktif)
  lastLogin: String    # Waktu login terakhir
  createdAt: String!   # Tanggal dibuat
  updatedAt: String!   # Tanggal diperbarui
}
```

**AuthResponse** - Respons autentikasi
```graphql
type AuthResponse {
  token: String!       # Token JWT untuk autentikasi
  user: User!          # Informasi pengguna yang login
}
```

#### 📖 Query (Membaca Data)

**1. Mendapatkan Semua Pengguna**
```graphql
query GetAllUsers {
  users {
    id
    username
    email
    fullName
    role
    status
    createdAt
  }
}
```
- **Parameter:** Tidak ada
- **Output:** Array berisi semua data pengguna
- **Kegunaan:** Menampilkan daftar semua pengguna dalam sistem

**2. Mendapatkan Pengguna Berdasarkan ID**
```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    id
    username
    email
    fullName
    role
    status
    lastLogin
  }
}
```
- **Parameter:** 
  - `id` (ID!, wajib): ID unik pengguna
- **Output:** Data pengguna spesifik
- **Kegunaan:** Melihat detail informasi pengguna tertentu

**3. Mendapatkan Informasi Pengguna Saat Ini**
```graphql
query GetCurrentUser {
  currentUser {
    id
    username
    email
    fullName
    role
  }
}
```
- **Parameter:** Tidak ada (menggunakan token di header)
- **Output:** Data pengguna yang sedang login
- **Kegunaan:** Menampilkan profil pengguna yang sedang aktif

#### ✏️ Mutation (Mengubah Data)

**1. Login Pengguna**
```graphql
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    token
    user {
      id
      username
      email
      role
    }
  }
}
```
- **Parameter:**
  - `username` (String!, wajib): Nama pengguna
  - `password` (String!, wajib): Kata sandi
- **Output:** Token autentikasi dan data pengguna
- **Contoh:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**2. Registrasi Pengguna Baru**
```graphql
mutation Register($input: RegisterInput!) {
  register(
    username: $input.username,
    email: $input.email,
    password: $input.password,
    fullName: $input.fullName,
    role: $input.role
  ) {
    token
    user {
      id
      username
      email
      fullName
      role
    }
  }
}
```
- **Parameter:**
  - `username` (String!, wajib): Nama pengguna
  - `email` (String!, wajib): Email pengguna
  - `password` (String!, wajib): Kata sandi
  - `fullName` (String): Nama lengkap
  - `role` (String): Peran pengguna

**3. Memperbarui Data Pengguna**
```graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(
    id: $id,
    username: $input.username,
    email: $input.email,
    fullName: $input.fullName,
    role: $input.role,
    status: $input.status
  ) {
    id
    username
    email
    fullName
    role
    status
  }
}
```
- **Parameter:**
  - `id` (ID!, wajib): ID unik pengguna yang akan diperbarui
  - `username`, `email`, `fullName`, `role`, `status`: Data yang akan diperbarui

---

### 🏭 2. Production Management Service - Manajemen Produksi

**Endpoint:** `http://localhost:5001/graphql`

#### Tipe Data Utama

**ProductionRequest** - Permintaan produksi
```graphql
type ProductionRequest {
  id: ID!
  requestId: String!       # ID unik permintaan
  customerId: String!      # ID pelanggan
  productName: String!     # Nama produk
  quantity: Int!           # Jumlah produk
  priority: Priority!      # Prioritas (low, normal, high, urgent)
  dueDate: String!         # Tanggal deadline
  specifications: String   # Spesifikasi produk
  status: RequestStatus!   # Status permintaan
  marketplaceData: String  # Data marketplace
  batches: [ProductionBatch] # Batch produksi terkait
  createdAt: String!
  updatedAt: String!
}
```

**ProductionBatch** - Batch produksi
```graphql
type ProductionBatch {
  id: ID!
  batchNumber: String!        # Nomor batch unik
  requestId: Int!             # ID permintaan produksi
  scheduledStartDate: String  # Tanggal mulai terjadwal
  scheduledEndDate: String    # Tanggal selesai terjadwal
  actualStartDate: String     # Tanggal mulai aktual
  actualEndDate: String       # Tanggal selesai aktual
  quantity: Int!              # Jumlah produk dalam batch
  status: BatchStatus!        # Status batch
  materialsAssigned: Boolean! # Apakah material sudah dialokasikan
  machineAssigned: Boolean!   # Apakah mesin sudah dialokasikan
  notes: String               # Catatan
  request: ProductionRequest  # Data permintaan terkait
  steps: [ProductionStep]     # Langkah-langkah produksi
  materialAllocations: [MaterialAllocation] # Alokasi material
  createdAt: String!
  updatedAt: String!
}
```

#### 📖 Query (Membaca Data)

**1. Mendapatkan Semua Permintaan Produksi**
```graphql
query GetAllProductionRequests {
  productionRequests {
    id
    requestId
    customerId
    productName
    quantity
    priority
    dueDate
    status
    createdAt
  }
}
```
- **Parameter:** Tidak ada
- **Output:** Array berisi semua data permintaan produksi
- **Kegunaan:** Menampilkan daftar semua permintaan produksi dalam sistem

**2. Mendapatkan Permintaan Produksi Berdasarkan ID**
```graphql
query GetProductionRequest($id: ID!) {
  productionRequest(id: $id) {
    id
    requestId
    customerId
    productName
    quantity
    priority
    dueDate
    specifications
    status
    batches {
      id
      batchNumber
      status
      quantity
    }
  }
}
```
- **Parameter:** 
  - `id` (ID!, wajib): ID unik permintaan produksi
- **Output:** Data permintaan produksi spesifik
- **Kegunaan:** Melihat detail informasi permintaan produksi tertentu

**3. Mendapatkan Permintaan Berdasarkan Status**
```graphql
query GetRequestsByStatus($status: RequestStatus!) {
  productionRequestsByStatus(status: $status) {
    id
    requestId
    productName
    priority
    dueDate
    status
  }
}
```
- **Parameter:**
  - `status` (RequestStatus!, wajib): Status permintaan
- **Output:** Array berisi data permintaan produksi dengan status tertentu
- **Kegunaan:** Memfilter permintaan produksi berdasarkan status

**4. Mendapatkan Semua Batch Produksi**
```graphql
query GetAllBatches {
  productionBatches {
    id
    batchNumber
    requestId
    quantity
    status
    scheduledStartDate
    scheduledEndDate
    request {
      productName
      customerId
    }
  }
}
```
- **Parameter:** Tidak ada
- **Output:** Array berisi semua data batch produksi
- **Kegunaan:** Menampilkan daftar semua batch produksi dalam sistem

**5. Mendapatkan Batch Produksi Berdasarkan ID**
```graphql
query GetProductionBatch($id: ID!) {
  productionBatch(id: $id) {
    id
    batchNumber
    requestId
    quantity
    status
    scheduledStartDate
    scheduledEndDate
    actualStartDate
    actualEndDate
    steps {
      id
      stepName
      status
    }
    materialAllocations {
      id
      materialId
      quantityRequired
      quantityAllocated
      status
    }
  }
}
```
- **Parameter:** 
  - `id` (ID!, wajib): ID unik batch produksi
- **Output:** Data batch produksi spesifik
- **Kegunaan:** Melihat detail informasi batch produksi tertentu

#### ✏️ Mutation (Mengubah Data)

**1. Membuat Permintaan Produksi Baru**
```graphql
mutation CreateProductionRequest($input: ProductionRequestInput!) {
  createProductionRequest(input: $input) {
    id
    requestId
    customerId
    productName
    quantity
    priority
    dueDate
    status
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "requestId": "REQ-001",
    "customerId": "CUST-123",
    "productName": "Widget A",
    "quantity": 100,
    "priority": "normal",
    "dueDate": "2024-12-31",
    "specifications": "Material: Steel, Color: Blue",
    "marketplaceData": "{\"source\":\"online\"}"
  }
}
```

**2. Membuat Batch Produksi**
```graphql
mutation CreateBatch($input: ProductionBatchInput!) {
  createProductionBatch(input: $input) {
    id
    batchNumber
    requestId
    quantity
    status
    steps {
      id
      stepName
      status
    }
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "requestId": 1,
    "quantity": 50,
    "scheduledStartDate": "2024-01-15",
    "scheduledEndDate": "2024-01-25",
    "notes": "Batch pertama",
    "steps": [
      {
        "stepName": "Cutting",
        "machineType": "CNC_CUTTING",
        "scheduledStartTime": "2024-01-15T08:00:00Z",
        "scheduledEndTime": "2024-01-15T16:00:00Z"
      }
    ],
    "materials": [
      {
        "materialId": 1,
        "quantityRequired": 10.5,
        "unitOfMeasure": "kg"
      }
    ]
  }
}
```

**3. Menyetujui Permintaan Produksi**
```graphql
mutation ApproveRequest($id: ID!, $approvedBy: String!, $notes: String) {
  approveRequest(id: $id, approvedBy: $approvedBy, notes: $notes) {
    id
    requestId
    status
    approvedBy
    approvalDate
  }
}
```
- **Parameter:**
  - `id` (ID!, wajib): ID unik permintaan produksi
  - `approvedBy` (String!, wajib): Nama atau ID yang menyetujui
  - `notes` (String): Catatan persetujuan

---

### 📋 3. Production Planning Service - Perencanaan Produksi

**Endpoint:** `http://localhost:5002/graphql`

#### Tipe Data Utama

**ProductionPlan** - Rencana produksi
```graphql
type ProductionPlan {
  id: ID
  planId: String              # ID rencana unik
  requestId: Int              # ID permintaan produksi
  productionRequestId: String # ID permintaan produksi (string)
  productName: String         # Nama produk
  plannedStartDate: String    # Tanggal mulai rencana
  plannedEndDate: String      # Tanggal selesai rencana
  priority: String            # Prioritas
  status: String              # Status rencana
  planningNotes: String       # Catatan perencanaan
  totalCapacityRequired: Float # Total kapasitas yang dibutuhkan
  totalMaterialCost: Float    # Total biaya material
  plannedBatches: Int         # Jumlah batch yang direncanakan
  approvedBy: String          # Disetujui oleh
  approvalDate: String        # Tanggal persetujuan
  createdAt: String
  updatedAt: String
  capacityPlans: [CapacityPlan] # Rencana kapasitas
  materialPlans: [MaterialPlan] # Rencana material
}
```

#### 📖 Query (Membaca Data)

**1. Mendapatkan Semua Rencana Produksi**
```graphql
query GetAllPlans {
  plans {
    id
    planId
    productName
    plannedStartDate
    plannedEndDate
    priority
    status
    totalCapacityRequired
    totalMaterialCost
  }
}
```

**2. Mendapatkan Detail Rencana Produksi**
```graphql
query GetPlan($id: ID!) {
  plan(id: $id) {
    id
    planId
    productName
    plannedStartDate
    plannedEndDate
    priority
    status
    planningNotes
    capacityPlans {
      id
      machineType
      hoursRequired
      startDate
      endDate
      status
    }
    materialPlans {
      id
      materialName
      quantityRequired
      unitOfMeasure
      unitCost
      totalCost
    }
  }
}
```

#### ✏️ Mutation (Mengubah Data)

**1. Membuat Rencana Produksi Baru**
```graphql
mutation CreatePlan($input: PlanInput!) {
  createPlan(input: $input) {
    id
    planId
    productName
    plannedStartDate
    plannedEndDate
    priority
    status
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "requestId": 1,
    "productName": "Custom Widget",
    "plannedStartDate": "2024-01-15",
    "plannedEndDate": "2024-02-10",
    "priority": "normal",
    "planningNotes": "Rencana produksi untuk Widget A"
  }
}
```

**2. Menambah Rencana Kapasitas dan Material**
```graphql
# Tambah kapasitas mesin
mutation {
  addCapacityPlan(planId: "1", input: {
    machineType: "CNC_CUTTING"
    hoursRequired: 8.0
    startDate: "2024-01-15T08:00:00Z"
    endDate: "2024-01-15T16:00:00Z"
  }) {
    id
    status
  }
}

# Tambah material
mutation {
  addMaterialPlan(planId: "1", input: {
    materialId: 1
    materialName: "Aluminum Sheet"
    quantityRequired: 50.0
    unitOfMeasure: "kg"
    unitCost: 25.0
  }) {
    id
    totalCost
  }
}
```

**3. Menyetujui rencana produksi**
```graphql
mutation {
  approvePlan(
    id: "1"
    approvedBy: "admin"
    notes: "Rencana disetujui untuk produksi"
  ) {
    success
    message
    batchCreated {
      batchNumber
    }
  }
}
```

---

### 🤖 4. Machine Queue Service - Manajemen Antrian Mesin

**Endpoint:** `http://localhost:5003/graphql`

#### Tipe Data Utama

**Machine** - Data mesin
```graphql
type Machine {
  id: ID!
  machineId: String!      # ID mesin unik
  name: String!           # Nama mesin
  type: String!           # Tipe mesin
  manufacturer: String    # Produsen
  modelNumber: String     # Nomor model
  capacity: Float         # Kapasitas
  capacityUnit: String    # Satuan kapasitas
  location: String        # Lokasi
  installationDate: Date  # Tanggal instalasi
  lastMaintenance: Date   # Maintenance terakhir
  nextMaintenance: Date   # Maintenance berikutnya
  status: MachineStatus!  # Status mesin
  hoursPerDay: Float!     # Jam kerja per hari
  notes: String           # Catatan
  createdAt: Date!
  updatedAt: Date!
  queues: [MachineQueue]  # Antrian terkait
}
```

**MachineQueue** - Antrian mesin
```graphql
type MachineQueue {
  id: ID!
  queueId: String!           # ID antrian unik
  machineId: ID!             # ID mesin
  batchId: ID!               # ID batch
  batchNumber: String!       # Nomor batch
  productName: String!       # Nama produk
  stepId: ID                 # ID langkah
  stepName: String           # Nama langkah
  scheduledStartTime: Date   # Waktu mulai terjadwal
  scheduledEndTime: Date     # Waktu selesai terjadwal
  actualStartTime: Date      # Waktu mulai aktual
  actualEndTime: Date        # Waktu selesai aktual
  hoursRequired: Float!      # Jam yang dibutuhkan
  priority: QueuePriority!   # Prioritas
  status: QueueStatus!       # Status antrian
  operatorId: String         # ID operator
  operatorName: String       # Nama operator
  setupTime: Float           # Waktu setup
  position: Int!             # Posisi dalam antrian
  notes: String              # Catatan
  createdAt: Date!
  updatedAt: Date!
  machine: Machine           # Data mesin terkait
}
```

#### 📖 Query (Membaca Data)

**1. Mendapatkan Semua Mesin**
```graphql
query GetAllMachines($filter: MachineFilter) {
  machines(filter: $filter) {
    id
    machineId
    name
    type
    manufacturer
    status
    location
    hoursPerDay
  }
}
```
- **Parameter Filter:**
```json
{
  "filter": {
    "type": "CNC_CUTTING",
    "status": "operational"
  }
}
```

**2. Memeriksa Ketersediaan Kapasitas**
```graphql
query CheckCapacity(
  $machineType: String!,
  $hoursRequired: Float!,
  $startDate: String,
  $endDate: String
) {
  checkCapacity(
    machineType: $machineType,
    hoursRequired: $hoursRequired,
    startDate: $startDate,
    endDate: $endDate
  ) {
    available
    message
    machines {
      id
      name
      type
      status
    }
  }
}
```
- **Contoh Parameter:**
```json
{
  "machineType": "CNC_CUTTING",
  "hoursRequired": 8.0,
  "startDate": "2024-01-15T08:00:00Z",
  "endDate": "2024-01-15T16:00:00Z"
}
```

**3. Mendapatkan Antrian untuk Mesin Tertentu**
```graphql
query GetMachineQueues($machineId: ID!) {
  machineQueues(machineId: $machineId) {
    id
    queueId
    batchNumber
    productName
    priority
    status
    position
  }
}
```
- **Parameter:**
  - `machineId` (ID!, wajib): ID mesin
- **Output:** Array berisi data antrian untuk mesin tertentu
- **Kegunaan:** Melihat antrian yang terkait dengan mesin tertentu

#### ✏️ Mutation (Mengubah Data)

**1. Membuat Mesin Baru**
```graphql
mutation CreateMachine($input: CreateMachineInput!) {
  createMachine(input: $input) {
    id
    machineId
    name
    type
    manufacturer
    status
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "name": "CNC Machine 01",
    "type": "CNC_CUTTING",
    "manufacturer": "Haas Automation",
    "modelNumber": "VF-2",
    "capacity": 1000.0,
    "capacityUnit": "mm",
    "location": "Workshop A",
    "hoursPerDay": 16.0,
    "notes": "Mesin CNC untuk pemotongan presisi"
  }
}
```

**2. Membuat Antrian Baru**
```graphql
mutation CreateQueue($input: CreateQueueInput!) {
  createQueue(input: $input) {
    id
    queueId
    batchNumber
    productName
    priority
    status
    position
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "machineId": "1",
    "batchId": "1",
    "batchNumber": "B001",
    "productName": "Widget A",
    "stepName": "Cutting Operation",
    "hoursRequired": 4.0,
    "priority": "normal",
    "scheduledStartTime": "2024-01-15T08:00:00Z",
    "scheduledEndTime": "2024-01-15T12:00:00Z"
  }
}
```

**3. Memulai Antrian**
```graphql
mutation StartQueue($id: ID!, $operatorId: String, $operatorName: String) {
  startQueue(id: $id, operatorId: $operatorId, operatorName: $operatorName) {
    id
    status
    actualStartTime
    operatorName
  }
}
```
- **Parameter:**
  - `id` (ID!, wajib): ID unik antrian
  - `operatorId` (String, opsional): ID operator
  - `operatorName` (String, opsional): Nama operator

---

### 📦 5. Material Inventory Service - Manajemen Inventaris Material

**Endpoint:** `http://localhost:5004/graphql`

#### Tipe Data Utama

**Material** - Data material
```graphql
type Material {
  id: ID!
  materialId: String!      # ID material unik
  name: String!            # Nama material
  description: String      # Deskripsi
  category: String!        # Kategori material
  type: String!            # Tipe material
  unit: String!            # Satuan
  stockQuantity: Float!    # Jumlah stok
  reorderLevel: Float      # Level pemesanan ulang
  price: Float             # Harga per unit
  leadTime: Int            # Waktu tunggu (hari)
  location: String         # Lokasi penyimpanan
  supplierId: ID           # ID pemasok
  status: String!          # Status material
  notes: String            # Catatan
  createdAt: String
  updatedAt: String
  supplierInfo: Supplier   # Info pemasok
  transactions: [MaterialTransaction] # Transaksi terkait
}
```

**Supplier** - Data pemasok
```graphql
type Supplier {
  id: ID!
  supplierId: String!      # ID pemasok unik
  name: String!            # Nama pemasok
  address: String          # Alamat
  city: String             # Kota
  contactPerson: String    # Kontak person
  phone: String            # Telepon
  email: String            # Email
  paymentTerms: String     # Syarat pembayaran
  leadTime: Int            # Waktu tunggu
  rating: Float            # Rating
  status: String!          # Status
  materials: [Material]    # Material yang disediakan
}
```

#### 📖 Query (Membaca Data)

**1. Mendapatkan Semua Material**
```graphql
query GetAllMaterials($category: String, $lowStock: Boolean) {
  materials(category: $category, lowStock: $lowStock) {
    id
    materialId
    name
    category
    type
    unit
    stockQuantity
    reorderLevel
    price
    status
    supplierInfo {
      name
      contactPerson
    }
  }
}
```
- **Parameter:**
  - `category` (String, opsional): Filter berdasarkan kategori
  - `lowStock` (Boolean, opsional): Filter material dengan stok rendah
- **Output:** Array berisi semua data material
- **Kegunaan:** Menampilkan daftar semua material dalam sistem

**2. Mendapatkan Material Berdasarkan ID**
```graphql
query GetMaterial($id: ID!) {
  material(id: $id) {
    id
    materialId
    name
    description
    category
    type
    unit
    stockQuantity
    reorderLevel
    price
    leadTime
    location
    supplierId
    status
    notes
  }
}
```
- **Parameter:** 
  - `id` (ID!, wajib): ID unik material
- **Output:** Data material spesifik
- **Kegunaan:** Melihat detail informasi material tertentu

**3. Memeriksa Ketersediaan Stok**
```graphql
query CheckStock($input: [StockCheckInput!]!) {
  checkStock(input: $input) {
    materialId
    name
    available
    stockQuantity
    requestedQuantity
    difference
  }
}
```
- **Parameter Input:**
```json
{
  "input": [
    {
      "materialId": "1",
      "quantity": 50.0
    },
    {
      "materialId": "2", 
      "quantity": 25.5
    }
  ]
}
```

**4. Mendapatkan Laporan Stok**
```graphql
query GetStockReport($category: String, $lowStock: Boolean) {
  stockReport(category: $category, lowStock: $lowStock) {
    totalItems
    totalValue
    lowStockItems
    categories
    materials {
      name
      stockQuantity
      reorderLevel
      status
    }
  }
}
```

#### ✏️ Mutation (Mengubah Data)

**1. Membuat Material Baru**
```graphql
mutation CreateMaterial($input: MaterialInput!) {
  createMaterial(input: $input) {
    id
    materialId
    name
    category
    type
    unit
    stockQuantity
    price
    status
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "name": "Steel Rod 10mm",
    "description": "Stainless steel rod diameter 10mm",
    "category": "Raw Material",
    "type": "Steel",
    "unit": "meter",
    "stockQuantity": 1000.0,
    "reorderLevel": 100.0,
    "price": 15.50,
    "leadTime": 7,
    "location": "Warehouse A-1",
    "supplierId": "1",
    "status": "active"
  }
}
```

**2. Penerimaan Material**
```graphql
mutation ReceiveMaterial($input: TransactionInput!) {
  receiveMaterial(input: $input) {
    id
    transactionId
    type
    materialId
    quantity
    unitPrice
    totalPrice
    transactionDate
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "type": "receipt",
    "materialId": "1",
    "quantity": 500.0,
    "unit": "meter",
    "supplierId": "1",
    "referenceNumber": "PO-2024-001",
    "unitPrice": 15.50,
    "notes": "Penerimaan material dari supplier"
  }
}
```

**3. Pengeluaran Material**
```graphql
mutation IssueMaterial($input: TransactionInput!) {
  issueMaterial(input: $input) {
    id
    transactionId
    type
    materialId
    quantity
    transactionDate
    notes
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "type": "issue",
    "materialId": "1",
    "quantity": 100.0,
    "unit": "meter",
    "transactionDate": "2024-01-20",
    "notes": "Pengeluaran material untuk produksi"
  }
}
```

---

### 📊 6. Production Feedback Service - Umpan Balik Produksi

**Endpoint:** `http://localhost:5005/graphql`

#### Tipe Data Utama

**ProductionFeedback** - Umpan balik produksi
```graphql
type ProductionFeedback {
  id: ID!
  feedbackId: String!         # ID feedback unik
  batchId: String!            # ID batch
  orderId: String             # ID order
  productId: String           # ID produk
  productName: String!        # Nama produk
  productionPlanId: String    # ID rencana produksi
  status: ProductionStatus!   # Status produksi
  plannedQuantity: Int!       # Jumlah yang direncanakan
  actualQuantity: Int         # Jumlah aktual
  defectQuantity: Int         # Jumlah cacat
  qualityScore: Float         # Skor kualitas
  startDate: String           # Tanggal mulai
  endDate: String             # Tanggal selesai
  isMarketplaceUpdated: Boolean! # Sudah diupdate ke marketplace
  notes: String               # Catatan
  createdAt: String!
  updatedAt: String!
  steps: [ProductionStep]     # Langkah produksi
  qualityChecks: [QualityCheck] # Pemeriksaan kualitas
  images: [FeedbackImage]     # Gambar terkait
  comments: [FeedbackComment] # Komentar
}
```

**ProductionStep** - Langkah produksi
```graphql
type ProductionStep {
  id: ID!
  stepId: String!           # ID langkah unik
  feedbackId: String!       # ID feedback
  stepName: String!         # Nama langkah
  stepOrder: Int!           # Urutan langkah
  machineId: String         # ID mesin
  machineName: String       # Nama mesin
  operatorId: String        # ID operator
  operatorName: String      # Nama operator
  status: StepStatus!       # Status langkah
  startTime: String         # Waktu mulai
  endTime: String           # Waktu selesai
  duration: Int             # Durasi (menit)
  plannedQuantity: Int!     # Jumlah yang direncanakan
  actualQuantity: Int       # Jumlah aktual
  defectQuantity: Int       # Jumlah cacat
  notes: String             # Catatan
}
```

#### 📖 Query (Membaca Data)

**1. Mendapatkan Semua Feedback dengan Paginasi**
```graphql
query GetAllFeedback($pagination: PaginationInput, $filters: FeedbackFilterInput) {
  getAllFeedback(pagination: $pagination, filters: $filters) {
    totalItems
    totalPages
    currentPage
    items {
      id
      feedbackId
      batchId
      productName
      status
      plannedQuantity
      actualQuantity
      qualityScore
      createdAt
    }
  }
}
```
- **Parameter:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 10
  },
  "filters": {
    "status": "in_production",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

**2. Mendapatkan Ringkasan Produksi**
```graphql
query GetProductionSummary($timeframe: String) {
  getProductionSummary(timeframe: $timeframe) {
    totalBatches
    completedBatches
    inProductionBatches
    onHoldBatches
    cancelledBatches
    totalPlannedQuantity
    totalActualQuantity
    totalDefectQuantity
    averageQualityScore
    timeframe
  }
}
```
- **Parameter:**
  - `timeframe` (String, opsional): Rentang waktu (misal "daily", "weekly", "monthly", "yearly")
- **Output:** Ringkasan statistik produksi
- **Kegunaan:** Melihat ringkasan kinerja produksi dalam periode tertentu

**3. Mendapatkan Detail Feedback**
```graphql
query GetFeedbackDetail($id: ID!) {
  getFeedbackById(id: $id) {
    id
    feedbackId
    batchId
    productName
    status
    plannedQuantity
    actualQuantity
    defectQuantity
    qualityScore
    steps {
      stepName
      status
      startTime
      endTime
      actualQuantity
    }
    qualityChecks {
      checkName
      result
      checkDate
      inspectorName
    }
    comments {
      content
      commentType
      userName
      createdAt
    }
  }
}
```
- **Parameter:** 
  - `id` (ID!, wajib): ID unik feedback
- **Output:** Data feedback spesifik
- **Kegunaan:** Melihat detail umpan balik produksi tertentu

#### ✏️ Mutation (Mengubah Data)

**1. Membuat Feedback Baru**
```graphql
mutation CreateFeedback($input: ProductionFeedbackInput!) {
  createFeedback(input: $input) {
    id
    feedbackId
    batchId
    productName
    status
    plannedQuantity
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "batchId": "BATCH-001",
    "orderId": "ORDER-001",
    "productId": "PROD-001",
    "productName": "Contoh Produk",
    "plannedQuantity": 100,
    "plannedStartDate": "2025-06-04",
    "plannedEndDate": "2025-06-10",
    "status": "pending"
  }
}
```

**2. Membuat Langkah Produksi**
```graphql
mutation CreateStep($input: ProductionStepInput!) {
  createStep(input: $input) {
    id
    stepId
    stepName
    stepOrder
    status
    plannedQuantity
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "feedbackId": "FEEDBACK-001",
    "stepName": "Cutting Operation",
    "stepOrder": 1,
    "machineId": "MACHINE-001",
    "machineName": "CNC Machine 01",
    "operatorId": "OP001",
    "operatorName": "John Doe",
    "status": "pending",
    "plannedQuantity": 100
  }
}
```

**3. Membuat Pemeriksaan Kualitas**
```graphql
mutation CreateQualityCheck($input: QualityCheckInput!) {
  createQualityCheck(input: $input) {
    id
    checkId
    checkName
    result
    checkDate
    inspectorName
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "feedbackId": "FEEDBACK-001",
    "stepId": "STEP-001",
    "checkName": "Dimensional Check",
    "checkType": "measurement",
    "checkDate": "2024-01-15T10:00:00Z",
    "inspectorName": "Jane Smith",
    "result": "pass",
    "standardValue": "10.0mm",
    "actualValue": "9.98mm",
    "tolerance": "±0.05mm"
  }
}
```

**4. Menambah Komentar**
```graphql
mutation CreateComment($input: FeedbackCommentInput!) {
  createComment(input: $input) {
    id
    commentId
    content
    commentType
    userName
    createdAt
  }
}
```
- **Parameter Input:**
```json
{
  "input": {
    "feedbackId": "FEEDBACK-001",
    "commentType": "internal",
    "content": "Periksa kembali jumlah produksi",
    "isImportant": true
  }
}
```

---

## 🚀 Contoh Penggunaan Lengkap

### Skenario: Membuat Permintaan Produksi Lengkap

**1. Login untuk mendapatkan token**
```graphql
# User Service
mutation {
  login(username: "admin", password: "admin123") {
    token
    user { username role }
  }
}
```

**2. Membuat permintaan produksi baru**
```graphql
# Production Management Service
mutation {
  createProductionRequest(input: {
    requestId: "REQ-2024-001"
    customerId: "CUST-001"
    productName: "Custom Widget"
    quantity: 100
    priority: normal
    dueDate: "2024-02-15"
    specifications: "Material: Aluminum, Finish: Anodized"
  }) {
    id
    requestId
    status
  }
}
```

**3. Membuat rencana produksi**
```graphql
# Production Planning Service
mutation {
  createPlan(input: {
    requestId: 1
    productName: "Custom Widget"
    plannedStartDate: "2024-01-20"
    plannedEndDate: "2024-02-10"
    priority: "normal"
    planningNotes: "Rencana produksi untuk Widget A"
  }) {
    id
    planId
    status
  }
}
```

**4. Menambah rencana kapasitas dan material**
```graphql
# Tambah kapasitas mesin
mutation {
  addCapacityPlan(planId: "1", input: {
    machineType: "CNC_CUTTING"
    hoursRequired: 8.0
    startDate: "2024-01-15T08:00:00Z"
    endDate: "2024-01-15T16:00:00Z"
  }) {
    id
    status
  }
}

# Tambah material
mutation {
  addMaterialPlan(planId: "1", input: {
    materialId: 1
    materialName: "Aluminum Sheet"
    quantityRequired: 50.0
    unitOfMeasure: "kg"
    unitCost: 25.0
  }) {
    id
    totalCost
  }
}
```

**5. Menyetujui rencana produksi**
```graphql
mutation {
  approvePlan(
    id: "1"
    approvedBy: "admin"
    notes: "Rencana disetujui untuk produksi"
  ) {
    success
    message
    batchCreated {
      batchNumber
    }
  }
}
```

---

## Autentikasi

Untuk mengakses API yang memerlukan autentikasi, tambahkan header berikut:

```http
Authorization: Bearer <token_dari_login>
```

Contoh menggunakan curl:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     -H "Content-Type: application/json" \
     -d '{"query":"query { currentUser { username role } }"}' \
     http://localhost:5006/graphql
```

## Error Handling

Semua layanan menggunakan format error standar GraphQL:

```json
{
  "errors": [
    {
      "message": "Pesan error yang jelas",
      "locations": [{"line": 2, "column": 3}],
      "path": ["fieldName"]
    }
  ],
  "data": null
}
```

## Tips Penggunaan

1. **Gunakan Apollo Sandbox** untuk testing queries di browser
2. **Selalu sertakan token** untuk operasi yang memerlukan autentikasi
3. **Periksa status layanan** di endpoint `/health` sebelum menggunakan API
4. **Gunakan paginasi** untuk query yang mengembalikan data dalam jumlah besar
5. **Manfaatkan filter** untuk memperoleh data yang spesifik

---

## Pengujian GraphQL

Setiap layanan memiliki endpoint GraphQL yang dapat diuji menggunakan Apollo Sandbox atau tools lain seperti Postman.

### 1. Menggunakan Apollo Sandbox

Apollo Sandbox tersedia di endpoint GraphQL masing-masing layanan:

```
http://localhost:5001/graphql  # Production Management
http://localhost:5002/graphql  # Production Planning
http://localhost:5003/graphql  # Machine Queue
http://localhost:5004/graphql  # Material Inventory
http://localhost:5005/graphql  # Production Feedback
```

### 2. Contoh Query GraphQL

#### User Service (Autentikasi)

```graphql
mutation Login {
  login(input: { username: "admin", password: "admin123" }) {
    token
    user {
      id
      username
      role
    }
  }
}
```

#### Production Feedback

```graphql
# Mendapatkan daftar feedback dengan paginasi
query GetAllFeedback {
  getAllFeedback(pagination: { page: 1, limit: 10 }) {
    totalItems
    totalPages
    currentPage
    items {
      id
      feedbackId
      batchId
      status
      productName
      createdAt
    }
  }
}

# Membuat feedback baru (memerlukan token autentikasi)
mutation CreateFeedback {
  createFeedback(
    input: {
      batchId: "BATCH-001"
      orderId: "ORDER-001"
      productId: "PROD-001"
      productName: "Contoh Produk"
      plannedQuantity: 100
      plannedStartDate: "2025-06-04"
      plannedEndDate: "2025-06-10"
      status: "pending"
    }
  ) {
    id
    feedbackId
    batchId
    status
  }
}
```

#### Material Inventory

```graphql
# Mendapatkan daftar material
query GetAllMaterials {
  getAllMaterials(pagination: { page: 1, limit: 10 }) {
    totalItems
    totalPages
    currentPage
    items {
      id
      materialId
      name
      quantity
      unit
      createdAt
    }
  }
}
```

### 3. Autentikasi di GraphQL

Untuk query/mutation yang memerlukan autentikasi:

1. Dapatkan token dengan menjalankan mutation `login` di User Service
2. Tambahkan token ke HTTP Headers pada Apollo Sandbox:
   ```json
   {
     "Authorization": "Bearer [token_yang_didapat]"
   }
   ```

## Struktur Folder

Setiap layanan memiliki struktur folder yang serupa:

```
layanan/
├── node_modules/
├── public/          # Aset statis
├── src/
│   ├── controllers/ # Controller untuk endpoint REST
│   ├── models/      # Model database Sequelize
│   ├── routes/      # Rute API dan UI
│   ├── graphql/     # Skema dan resolver GraphQL
│   ├── middlewares/ # Middleware aplikasi
│   ├── utils/       # Utilitas umum
│   └── app.js       # Entry point aplikasi
├── uploads/         # Folder upload file
├── views/           # Template UI
├── .env             # Konfigurasi environment
├── .gitignore
├── package.json
└── README.md
```

## Pemecahan Masalah

### Database Connection Issues

Jika terjadi masalah koneksi database:

1. Pastikan server MySQL berjalan
2. Periksa kredensial database di file `.env`
3. Periksa apakah database telah dibuat

### Service Communication Issues

Jika terjadi masalah komunikasi antar layanan:

1. Pastikan semua layanan berjalan
2. Periksa konfigurasi URL layanan di file `.env`
3. Pastikan tidak ada konflik port

### Auth Issues

Jika terjadi masalah autentikasi:

1. Pastikan User Service berjalan dengan benar
2. Periksa JWT_SECRET di file `.env` apakah sama di semua layanan
3. Periksa apakah token belum kedaluwarsa

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
