import React, { useState, useEffect } from 'react';

function ProductionOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data pesanan produksi dari API
    const fetchOrders = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, orderId: 'PO001', productId: 'PROD001', quantity: 100, status: 'Selesai', dueDate: '2023-03-03' },
              { id: 2, orderId: 'PO002', productId: 'PROD004', quantity: 150, status: 'Dalam Proses', dueDate: '2023-03-07' },
              { id: 3, orderId: 'PO003', productId: 'PROD005', quantity: 80, status: 'Baru', dueDate: '2023-03-12' },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setOrders(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div>Memuat pesanan produksi...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="production-order-container">
      <h1>Pesanan Produksi</h1>
      {orders.length === 0 ? (
        <p>Tidak ada pesanan produksi yang tersedia.</p>
      ) : (
        <table className="order-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Pesanan</th>
              <th>ID Produk</th>
              <th>Kuantitas</th>
              <th>Status</th>
              <th>Tanggal Jatuh Tempo</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.orderId}</td>
                <td>{order.productId}</td>
                <td>{order.quantity}</td>
                <td>{order.status}</td>
                <td>{order.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProductionOrder;