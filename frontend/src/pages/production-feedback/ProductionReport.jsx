import React, { useState, useEffect } from 'react';

function ProductionReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data laporan produksi dari API
    const fetchReports = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, productionId: 'PROD001', date: '2023-03-01', quantity: 100, status: 'Selesai' },
              { id: 2, productionId: 'PROD002', date: '2023-03-05', quantity: 150, status: 'Selesai' },
              { id: 3, productionId: 'PROD003', date: '2023-03-10', quantity: 80, status: 'Dalam Proses' },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setReports(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div>Memuat laporan produksi...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="production-report-container">
      <h1>Laporan Produksi</h1>
      {reports.length === 0 ? (
        <p>Tidak ada laporan produksi yang tersedia.</p>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Produksi</th>
              <th>Tanggal</th>
              <th>Kuantitas</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.productionId}</td>
                <td>{report.date}</td>
                <td>{report.quantity}</td>
                <td>{report.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductionReport;