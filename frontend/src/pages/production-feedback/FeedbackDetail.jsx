import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function FeedbackDetail() {
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil detail feedback dari API berdasarkan ID
    const fetchFeedbackDetail = async () => {
      try {
        // Simulasi pengambilan data
        const response = await new Promise(resolve => setTimeout(() => {
          const mockFeedbacks = [
            { id: 1, productionId: 'PROD001', feedback: 'Kualitas produk sangat baik.', date: '2023-03-01' },
            { id: 2, productionId: 'PROD002', feedback: 'Pengiriman tepat waktu.', date: '2023-03-05' },
            { id: 3, productionId: 'PROD003', feedback: 'Ada sedikit cacat pada kemasan.', date: '2023-03-10' },
          ];
          const foundFeedback = mockFeedbacks.find(f => f.id === parseInt(id));
          resolve({ ok: true, json: () => Promise.resolve(foundFeedback) });
        }, 500));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFeedback(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackDetail();
  }, [id]);

  if (loading) {
    return <div>Memuat detail feedback...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!feedback) {
    return <div>Feedback tidak ditemukan.</div>;
  }

  return (
    <div className="feedback-detail-container">
      <h1>Detail Feedback Produksi</h1>
      <p><strong>ID Feedback:</strong> {feedback.id}</p>
      <p><strong>ID Produksi:</strong> {feedback.productionId}</p>
      <p><strong>Feedback:</strong> {feedback.feedback}</p>
      <p><strong>Tanggal:</strong> {feedback.date}</p>
      {/* Tambahkan elemen UI lainnya sesuai kebutuhan */}
    </div>
  );
}

export default FeedbackDetail;