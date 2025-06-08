import React, { useState, useEffect } from 'react';

function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil data feedback dari API
    const fetchFeedbacks = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve([
              { id: 1, productionId: 'PROD001', feedback: 'Kualitas produk sangat baik.', date: '2023-03-01' },
              { id: 2, productionId: 'PROD002', feedback: 'Pengiriman tepat waktu.', date: '2023-03-05' },
              { id: 3, productionId: 'PROD003', feedback: 'Ada sedikit cacat pada kemasan.', date: '2023-03-10' },
            ])
          });
        }, 1000));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFeedbacks(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) {
    return <div>Memuat daftar feedback...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="feedback-list-container">
      <h1>Daftar Feedback Produksi</h1>
      {feedbacks.length === 0 ? (
        <p>Tidak ada feedback yang tersedia.</p>
      ) : (
        <table className="feedback-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Produksi</th>
              <th>Feedback</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map(feedback => (
              <tr key={feedback.id}>
                <td>{feedback.id}</td>
                <td>{feedback.productionId}</td>
                <td>{feedback.feedback}</td>
                <td>{feedback.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FeedbackList;