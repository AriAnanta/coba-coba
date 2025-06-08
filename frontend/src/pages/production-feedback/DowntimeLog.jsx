import React, { useState, useEffect } from 'react';

function DowntimeLog() {
  const [downtimeLogs, setDowntimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data log downtime dari API
    const fetchDowntimeLogs = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, machineId: 'MESIN001', startTime: '2023-03-01 09:00:00', endTime: '2023-03-01 09:30:00', reason: 'Perbaikan mendadak' },
              { id: 2, machineId: 'MESIN002', startTime: '2023-03-05 11:00:00', endTime: '2023-03-05 12:00:00', reason: 'Pemeliharaan terjadwal' },
              { id: 3, machineId: 'MESIN001', startTime: '2023-03-10 16:00:00', endTime: '2023-03-10 16:15:00', reason: 'Gangguan listrik' },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDowntimeLogs(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDowntimeLogs();
  }, []);

  if (loading) {
    return <div>Memuat log downtime...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="downtime-log-container">
      <h1>Log Downtime Mesin</h1>
      {downtimeLogs.length === 0 ? (
        <p>Tidak ada log downtime yang tersedia.</p>
      ) : (
        <table className="downtime-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Mesin</th>
              <th>Waktu Mulai</th>
              <th>Waktu Selesai</th>
              <th>Alasan</th>
            </tr>
          </thead>
          <tbody>
            {downtimeLogs.map(log => (
              <tr key={log.id}>
                <td>{log.id}</td>
                <td>{log.machineId}</td>
                <td>{log.startTime}</td>
                <td>{log.endTime}</td>
                <td>{log.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DowntimeLog;