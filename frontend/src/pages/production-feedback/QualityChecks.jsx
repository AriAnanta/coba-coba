import React, { useState, useEffect } from 'react';

function QualityChecks() {
  const [qualityChecks, setQualityChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data pemeriksaan kualitas dari API
    const fetchQualityChecks = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, productionId: 'PROD001', checkDate: '2023-03-01', result: 'Lulus', inspector: 'Inspektur A' },
              { id: 2, productionId: 'PROD002', checkDate: '2023-03-05', result: 'Lulus', inspector: 'Inspektur B' },
              { id: 3, productionId: 'PROD003', checkDate: '2023-03-10', result: 'Gagal', inspector: 'Inspektur A' },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setQualityChecks(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchQualityChecks();
  }, []);

  if (loading) {
    return <div>Memuat data pemeriksaan kualitas...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="quality-checks-container">
      <h1>Pemeriksaan Kualitas</h1>
      {qualityChecks.length === 0 ? (
        <p>Tidak ada data pemeriksaan kualitas yang tersedia.</p>
      ) : (
        <table className="quality-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Produksi</th>
              <th>Tanggal Cek</th>
              <th>Hasil</th>
              <th>Inspektur</th>
            </tr>
          </thead>
          <tbody>
            {qualityChecks.map(check => (
              <tr key={check.id}>
                <td>{check.id}</td>
                <td>{check.productionId}</td>
                <td>{check.checkDate}</td>
                <td>{check.result}</td>
                <td>{check.inspector}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default QualityChecks;