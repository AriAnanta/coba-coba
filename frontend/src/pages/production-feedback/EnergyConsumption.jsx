import React, { useState, useEffect } from 'react';

function EnergyConsumption() {
  const [consumptionData, setConsumptionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data konsumsi energi dari API
    const fetchConsumptionData = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, machineId: 'MESIN001', date: '2023-03-01', consumptionKWH: 150.5 },
              { id: 2, machineId: 'MESIN002', date: '2023-03-01', consumptionKWH: 200.0 },
              { id: 3, machineId: 'MESIN001', date: '2023-03-02', consumptionKWH: 145.2 },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setConsumptionData(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchConsumptionData();
  }, []);

  if (loading) {
    return <div>Memuat data konsumsi energi...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="energy-consumption-container">
      <h1>Konsumsi Energi Mesin</h1>
      {consumptionData.length === 0 ? (
        <p>Tidak ada data konsumsi energi yang tersedia.</p>
      ) : (
        <table className="energy-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Mesin</th>
              <th>Tanggal</th>
              <th>Konsumsi (KWH)</th>
            </tr>
          </thead>
          <tbody>
            {consumptionData.map(data => (
              <tr key={data.id}>
                <td>{data.id}</td>
                <td>{data.machineId}</td>
                <td>{data.date}</td>
                <td>{data.consumptionKWH}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EnergyConsumption;