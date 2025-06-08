const net = require('net');

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is available
 */
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
};

/**
 * Find an available port within a range
 * @param {number} startPort - Starting port number
 * @param {number} endPort - Ending port number
 * @returns {Promise<number|null>} - Available port number or null if none found
 */
const findAvailablePort = async (startPort, endPort) => {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
};

module.exports = {
  isPortAvailable,
  findAvailablePort
};
