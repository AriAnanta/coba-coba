/**
 * Script untuk menjalankan semua layanan On-Demand Manufacturing secara bersamaan
 */
const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Daftar layanan beserta port default
const services = [
  { name: "user_service", port: 5006, color: "\x1b[36m" }, // Cyan
  { name: "production_management", port: 5001, color: "\x1b[32m" }, // Green
  { name: "production_planning", port: 5300, color: "\x1b[33m" }, // Yellow
  { name: "machine_queue", port: 5003, color: "\x1b[35m" }, // Magenta
  { name: "material_inventory", port: 5004, color: "\x1b[34m" }, // Blue
  { name: "production_feedback", port: 5005, color: "\x1b[31m" }, // Red
];

// Konstanta warna reset
const resetColor = "\x1b[0m";

// Fungsi untuk mengecek dan install dependencies
function checkAndInstallDependencies() {
  console.log("\x1b[1m===== MENGECEK DEPENDENCIES =====\x1b[0m");

  for (const service of services) {
    const serviceDir = path.join(__dirname, service.name);
    const nodeModulesPath = path.join(serviceDir, "node_modules");

    if (!fs.existsSync(nodeModulesPath)) {
      console.log(
        `${service.color}[${service.name}]${resetColor} Installing dependencies...`
      );
      try {
        execSync("npm install", {
          cwd: serviceDir,
          stdio: "inherit",
        });
        console.log(
          `${service.color}[${service.name}]${resetColor} Dependencies installed successfully`
        );
      } catch (error) {
        console.error(
          `${service.color}[${service.name}]${resetColor} Failed to install dependencies: ${error.message}`
        );
      }
    } else {
      console.log(
        `${service.color}[${service.name}]${resetColor} Dependencies already installed`
      );
    }
  }
  console.log("");
}

// Fungsi untuk menjalankan layanan
function startService(service) {
  const serviceDir = path.join(__dirname, service.name);

  // Periksa apakah direktori layanan ada
  if (!fs.existsSync(serviceDir)) {
    console.error(
      `${service.color}[${service.name}]${resetColor} Direktori layanan tidak ditemukan: ${serviceDir}`
    );
    return;
  }

  // Periksa apakah package.json ada di direktori layanan
  const packageJsonPath = path.join(serviceDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.error(
      `${service.color}[${service.name}]${resetColor} File package.json tidak ditemukan di: ${packageJsonPath}`
    );
    return;
  }

  console.log(
    `${service.color}[${service.name}]${resetColor} Memulai layanan pada port ${service.port}...`
  );

  // Jalankan layanan dengan npm run dev (atau start jika dev tidak tersedia)
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const hasDevScript = packageJson.scripts && packageJson.scripts.dev;
    const command = process.platform === "win32" ? "npm.cmd" : "npm";
    const args = ["run", hasDevScript ? "dev" : "start"];

    const serviceProcess = spawn(command, args, {
      cwd: serviceDir,
      env: { ...process.env, PORT: service.port.toString() },
      stdio: "pipe",
      shell: true, // Tambahkan opsi shell: true untuk Windows
    });

    // Tangani output stdout
    serviceProcess.stdout.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line) => {
        if (line.trim()) {
          console.log(
            `${service.color}[${service.name}]${resetColor} ${line.trim()}`
          );
        }
      });
    });

    // Tangani output stderr
    serviceProcess.stderr.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line) => {
        if (line.trim()) {
          console.error(
            `${service.color}[${service.name}]${resetColor} ${line.trim()}`
          );
        }
      });
    });

    // Tangani penutupan proses
    serviceProcess.on("close", (code) => {
      console.log(
        `${service.color}[${service.name}]${resetColor} proses berhenti dengan kode: ${code}`
      );
    });

    // Tangani error
    serviceProcess.on("error", (err) => {
      console.error(
        `${service.color}[${service.name}]${resetColor} error: ${err.message}`
      );
    });

    return serviceProcess;
  } catch (error) {
    console.error(
      `${service.color}[${service.name}]${resetColor} Gagal memulai layanan: ${error.message}`
    );
    return null;
  }
}

// Memulai semua layanan
function startServicesSequentially() {
  console.log("\x1b[1m===== MEMULAI LAYANAN SECARA BERURUTAN =====\x1b[0m\n");

  const serviceProcesses = [];

  services.forEach((service, index) => {
    setTimeout(() => {
      const proc = startService(service);
      if (proc) {
        serviceProcesses.push(proc);
      }
    }, index * 2000); // Delay 2 detik antar service
  });

  return serviceProcesses;
}

const serviceProcesses = startServicesSequentially();

// Menangani sinyal penghentian
process.on("SIGINT", () => {
  console.log("\n\x1b[1m===== MENGHENTIKAN SEMUA LAYANAN =====\x1b[0m");

  // Hentikan semua proses layanan
  serviceProcesses.forEach((proc, index) => {
    if (proc) {
      const service = services[index];
      console.log(
        `${service.color}[${service.name}]${resetColor} Menghentikan layanan...`
      );

      // Kirim sinyal untuk menghentikan proses
      if (process.platform === "win32") {
        spawn("taskkill", ["/pid", proc.pid, "/f", "/t"]);
      } else {
        proc.kill("SIGINT");
      }
    }
  });

  // Beri waktu untuk log penutupan, lalu keluar
  setTimeout(() => {
    console.log("\x1b[1m===== SEMUA LAYANAN TELAH DIHENTIKAN =====\x1b[0m");
    process.exit(0);
  }, 1000);
});

console.log("\n\x1b[1m===== SEMUA LAYANAN TELAH DIMULAI =====\x1b[0m");
console.log("Tekan Ctrl+C untuk menghentikan semua layanan\n");

// Tambahkan script package.json di root untuk menjalankan layanan
console.log(
  "\x1b[1mTambahkan script berikut ke package.json root untuk mempermudah:\x1b[0m"
);
console.log(`
"scripts": {
  "start-all": "node start-services.js",
  "install-all": "node -e \\"const { execSync } = require('child_process'); ['user_service', 'production_management', 'production_planning', 'machine_queue', 'material_inventory', 'production_feedback'].forEach(dir => { console.log('Installing ' + dir); try { execSync('cd ' + dir + ' && npm install', {stdio: 'inherit'}); } catch(e) { console.error(e); } })\\""
}
`);

console.log("\n\x1b[1m===== INFORMASI AKSES LAYANAN =====\x1b[0m");
services.forEach((service) => {
  console.log(
    `${service.color}[${service.name}]${resetColor} http://localhost:${service.port}`
  );
});

console.log("\n\x1b[1m===== ENDPOINT API UTAMA =====\x1b[0m");
console.log(
  "\x1b[32m[production_management]\x1b[0m http://localhost:5001/api/batches"
);
console.log(
  "\x1b[33m[production_planning]\x1b[0m http://localhost:5002/api/requests"
);
console.log("\x1b[35m[machine_queue]\x1b[0m http://localhost:5003/api/queue");
console.log(
  "\x1b[34m[material_inventory]\x1b[0m http://localhost:5004/api/inventory"
);
console.log(
  "\x1b[31m[production_feedback]\x1b[0m http://localhost:5005/api/feedback"
);
console.log("\x1b[36m[user_service]\x1b[0m http://localhost:5006/api/users");

console.log("\n\x1b[1m===== PERINTAH YANG TERSEDIA =====\x1b[0m");
console.log("1. Untuk menjalankan: npm run start-all");
console.log("2. Untuk install semua dependencies: npm run install-all");
console.log("3. Untuk menghentikan: Tekan Ctrl+C");
