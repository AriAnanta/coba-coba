/**
 * Script untuk membuat struktur dasar semua layanan mikroservis
 */
const fs = require('fs');
const path = require('path');

// Konfigurasi layanan
const services = [
  { name: 'user_service', port: 5006, description: 'User Management Service' },
  { name: 'production_management', port: 5001, description: 'Production Batch Management Service' },
  { name: 'production_planning', port: 5002, description: 'Production Planning Service' },
  { name: 'machine_queue', port: 5003, description: 'Machine Queue Management Service' },
  { name: 'material_inventory', port: 5004, description: 'Material Inventory Service' },
  { name: 'production_feedback', port: 5005, description: 'Production Feedback Service' }
];

console.log('===== MEMBUAT STRUKTUR LAYANAN MIKROSERVIS =====\n');

// Fungsi untuk membuat package.json untuk setiap layanan
function createPackageJson(service) {
  const packageJson = {
    name: service.name.replace('_', '-'),
    version: '1.0.0',
    description: service.description,
    main: 'src/app.js',
    scripts: {
      start: 'node src/app.js',
      dev: 'nodemon src/app.js',
      test: 'echo "No tests specified" && exit 0'
    },
    dependencies: {
      express: '^4.18.2',
      cors: '^2.8.5',
      dotenv: '^16.3.1',
      helmet: '^7.0.0',
      morgan: '^1.10.0',
      mysql2: '^3.6.0',
      sequelize: '^6.32.1',
      axios: '^1.5.0',
      bcrypt: '^5.1.0',
      jsonwebtoken: '^9.0.2',
      'express-validator': '^7.0.1'
    },
    devDependencies: {
      nodemon: '^3.0.1'
    },
    keywords: ['microservice', 'manufacturing', 'nodejs'],
    author: 'Manufacturing Team',
    license: 'ISC'
  };

  return JSON.stringify(packageJson, null, 2);
}

// Fungsi untuk membuat app.js dasar untuk setiap layanan
function createAppJs(service) {
  return `/**
 * ${service.description}
 * Port: ${service.port}
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || ${service.port};

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: '${service.name}',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: '${service.description} API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    service: '${service.name}'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    service: '${service.name}'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 \${service.description} is running on port \${PORT}\`);
  console.log(\`📊 Health check: http://localhost:\${PORT}/health\`);
  console.log(\`🔗 API endpoint: http://localhost:\${PORT}/api\`);
});

module.exports = app;
`;
}

// Fungsi untuk membuat file .env
function createEnvFile(service) {
  return `# ${service.description} Environment Variables
NODE_ENV=development
PORT=${service.port}

# Database Configuration
DB_HOST=localhost
DB_PORT=3308
DB_NAME=production_management
DB_USER=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h

# Service URLs
USER_SERVICE_URL=http://localhost:5006
PRODUCTION_MANAGEMENT_URL=http://localhost:5001
PRODUCTION_PLANNING_URL=http://localhost:5002
MACHINE_QUEUE_URL=http://localhost:5003
MATERIAL_INVENTORY_URL=http://localhost:5004
PRODUCTION_FEEDBACK_URL=http://localhost:5005

# Other configurations
LOG_LEVEL=info
`;
}

// Fungsi untuk membuat .gitignore
function createGitignore() {
  return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;
}

// Membuat direktori dan file untuk setiap layanan
services.forEach(service => {
  const serviceDir = path.join(__dirname, service.name);
  const srcDir = path.join(serviceDir, 'src');
  
  console.log(`Creating ${service.name} service structure...`);
  
  // Buat direktori jika belum ada
  if (!fs.existsSync(serviceDir)) {
    fs.mkdirSync(serviceDir, { recursive: true });
  }
  
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }
  
  // Buat package.json
  fs.writeFileSync(
    path.join(serviceDir, 'package.json'),
    createPackageJson(service)
  );
  
  // Buat app.js
  fs.writeFileSync(
    path.join(srcDir, 'app.js'),
    createAppJs(service)
  );
  
  // Buat .env
  fs.writeFileSync(
    path.join(serviceDir, '.env'),
    createEnvFile(service)
  );
  
  // Buat .gitignore
  fs.writeFileSync(
    path.join(serviceDir, '.gitignore'),
    createGitignore()
  );
  
  console.log(`✅ ${service.name} structure created`);
});

console.log('\n===== STRUKTUR LAYANAN BERHASIL DIBUAT =====');
console.log('Jalankan perintah berikut untuk melanjutkan:');
console.log('1. npm run install-all');
console.log('2. npm run start-all');
console.log('\nSetiap layanan memiliki:');
console.log('- package.json dengan dependencies yang diperlukan');
console.log('- src/app.js sebagai entry point');
console.log('- .env untuk konfigurasi environment');
console.log('- .gitignore untuk mengabaikan file yang tidak perlu');
