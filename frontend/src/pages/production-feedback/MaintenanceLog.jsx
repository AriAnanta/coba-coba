import React, { useState, useEffect } from 'react';

function MaintenanceLog() {
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data log pemeliharaan dari API
    const fetchMaintenanceLogs = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, machineId: 'MESIN001', date: '2023-02-15', description: 'Pembersihan rutin', technician: 'Teknisi A' },
              { id: 2, machineId: 'MESIN002', date: '2023-02-20', description: 'Penggantian suku cadang', technician: 'Teknisi B' },
              { id: 3, machineId: 'MESIN001', date: '2023-03-01', description: 'Perbaikan minor', technician: 'Teknisi A' },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setMaintenanceLogs(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceLogs();
  }, []);

  if (loading) {
    return <div>Memuat log pemeliharaan...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="maintenance-log-container">
      <h1>Log Pemeliharaan Mesin</h1>
      {maintenanceLogs.length === 0 ? (
        <p>Tidak ada log pemeliharaan yang tersedia.</p>
      ) : (
        <table className="maintenance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Mesin</th>
              <th>Tanggal</th>
              <th>Deskripsi</th>
              <th>Teknisi</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceLogs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.machineId}</td>
                <td>{log.date}</td>
                <td>{log.description}</td>
                <td>{log.technician}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MaintenanceLog;