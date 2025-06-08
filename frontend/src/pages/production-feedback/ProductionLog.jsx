import React, { useState, useEffect } from 'react';

function ProductionLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data log produksi dari API
    const fetchLogs = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, timestamp: '2023-03-01 08:00:00', event: 'Mulai Produksi PROD001', user: 'Operator A' },
              { id: 2, timestamp: '2023-03-01 10:30:00', event: 'Selesai Produksi PROD001', user: 'Operator B' },
              { id: 3, timestamp: '2023-03-02 14:15:00', event: 'Mulai Produksi PROD002', user: 'Operator C' },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLogs(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <div>Memuat log produksi...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="production-log-container">
      <h1>Log Produksi</h1>
      {logs.length === 0 ? (
        <p>Tidak ada log produksi yang tersedia.</p>
      ) : (
        <table className="log-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>Event</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.timestamp}</td>
                <td>{log.event}</td>
                <td>{log.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductionLog;