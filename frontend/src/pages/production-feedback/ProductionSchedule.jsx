import React, { useState, useEffect } from 'react';

function ProductionSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data jadwal produksi dari API
    const fetchSchedules = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, productionId: 'PROD001', startDate: '2023-03-01', endDate: '2023-03-03', status: 'Selesai' },
              { id: 2, productionId: 'PROD004', startDate: '2023-03-05', endDate: '2023-03-07', status: 'Dalam Proses' },
              { id: 3, productionId: 'PROD005', startDate: '2023-03-10', endDate: '2023-03-12', status: 'Terjadwal' },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSchedules(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (loading) {
    return <div>Memuat jadwal produksi...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="production-schedule-container">
      <h1>Jadwal Produksi</h1>
      {schedules.length === 0 ? (
        <p>Tidak ada jadwal produksi yang tersedia.</p>
      ) : (
        <table className="schedule-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Produksi</th>
              <th>Tanggal Mulai</th>
              <th>Tanggal Selesai</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map(schedule => (
              <tr key={schedule.id}>
                <td>{schedule.id}</td>
                <td>{schedule.productionId}</td>
                <td>{schedule.startDate}</td>
                <td>{schedule.endDate}</td>
                <td>{schedule.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductionSchedule;