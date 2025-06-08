import React, { useState, useEffect } from 'react';

function ProductionDashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data dashboard produksi dari API
    const fetchDashboardData = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              totalProduction: 1500,
              completedOrders: 120,
              machinesOnline: 15,
              downtimeHours: 25.5,
              feedbackCount: 30,
            })
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Memuat data dashboard...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="production-dashboard-container">
      <h1>Dashboard Produksi</h1>
      <div className="dashboard-summary">
        <div className="summary-card">
          <h2>Total Produksi</h2>
          <p>{dashboardData.totalProduction} Unit</p>
        </div>
        <div className="summary-card">
          <h2>Pesanan Selesai</h2>
          <p>{dashboardData.completedOrders}</p>
        </div>
        <div className="summary-card">
          <h2>Mesin Online</h2>
          <p>{dashboardData.machinesOnline}</p>
        </div>
        <div className="summary-card">
          <h2>Jam Downtime</h2>
          <p>{dashboardData.downtimeHours} Jam</p>
        </div>
        <div className="summary-card">
          <h2>Jumlah Feedback</h2>
          <p>{dashboardData.feedbackCount}</p>
        </div>
      </div>
      {/* Tambahkan grafik atau komponen lain untuk visualisasi data */}
    </div>
  );
}

export default ProductionDashboard;