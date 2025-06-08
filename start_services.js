/**
 * Start Services Script
 * 
 * This script starts all microservices for the On-Demand Manufacturing application.
 * Each service runs on its own port.
 */
const { spawn } = require('child_process');
const path = require('path');

// Configuration for all microservices
const services = [
  { name: 'user_service', port: 3001 },
  { name: 'production_management', port: 3002 },
  { name: 'material_inventory', port: 3003 },
  { name: 'production_planning', port: 3004 },
  { name: 'machine_queue', port: 3005 },
  { name: 'production_feedback', port: 3006 }
];

console.log('Starting all microservices...');

// Start each service
services.forEach(service => {
  const env = { ...process.env, PORT: service.port };
  
  // Spawn a new process for each service
  const serviceProcess = spawn('node', ['src/app.js'], {
    cwd: path.join(__dirname, service.name),
    env: env,
    stdio: 'inherit'
  });
  
  console.log(`Started ${service.name} on port ${service.port}`);
  
  // Handle process events
  serviceProcess.on('error', (error) => {
    console.error(`Error starting ${service.name}:`, error);
  });
  
  serviceProcess.on('close', (code) => {
    console.log(`${service.name} exited with code ${code}`);
  });
});

console.log('All services started successfully.');
