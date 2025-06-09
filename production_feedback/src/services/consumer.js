/**
 * Consumer Service untuk Production Feedback
 * 
 * Service ini berfungsi sebagai consumer untuk Machine Queue dan membuat notifikasi
 * berdasarkan perubahan status pada antrian mesin.
 */
const axios = require('axios');
const amqp = require('amqplib');
const { ProductionFeedback, FeedbackNotification } = require('../models');
require('dotenv').config();

// Konfigurasi RabbitMQ
const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
const queueName = process.env.QUEUE_NAME || 'machine_queue_updates';

/**
 * Fungsi untuk membuat ID unik dengan format khusus
 * @param {string} prefix - Awalan untuk ID
 * @param {number} length - Panjang bagian random dari ID
 * @returns {string} - ID unik yang dihasilkan
 */
const generateUniqueId = (prefix, length = 8) => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Fungsi untuk membuat notifikasi baru
 * @param {string} feedbackId - ID feedback produksi
 * @param {string} type - Jenis notifikasi
 * @param {string} title - Judul notifikasi
 * @param {string} message - Isi pesan notifikasi
 * @param {string} recipientType - Jenis penerima notifikasi
 * @param {string} recipientId - ID penerima notifikasi
 * @param {string} priority - Prioritas notifikasi
 * @returns {Promise<Object>} - Objek notifikasi yang dibuat
 */
const createNotification = async (feedbackId, type, title, message, recipientType, recipientId, priority = 'medium') => {
  try {
    return await FeedbackNotification.create({
      notificationId: generateUniqueId('NOTIF'),
      feedbackId,
      type,
      title,
      message,
      recipientType,
      recipientId,
      priority,
      deliveryMethod: 'in_app'
    });
  } catch (error) {
    console.error('Error membuat notifikasi:', error);
    // Kita hanya log error tanpa mengganggu flow utama aplikasi
  }
};

/**
 * Fungsi untuk memproses pesan dari Machine Queue
 * @param {Object} message - Pesan dari Machine Queue
 * @returns {Promise<void>}
 */
const processQueueMessage = async (message) => {
  try {
    const queueData = JSON.parse(message.content.toString());
    console.log('Menerima pesan dari Machine Queue:', queueData);

    // Cek apakah pesan memiliki informasi yang diperlukan
    if (!queueData.queueId || !queueData.status) {
      console.error('Pesan tidak memiliki informasi yang diperlukan');
      return;
    }

    // Cari atau buat feedback produksi berdasarkan batch ID
    let feedback = await ProductionFeedback.findOne({
      where: { batchId: queueData.batchId }
    });

    if (!feedback) {
      // Buat feedback baru jika belum ada
      feedback = await ProductionFeedback.create({
        feedbackId: generateUniqueId('FB'),
        batchId: queueData.batchId,
        productName: queueData.productName,
        status: 'pending',
        plannedQuantity: queueData.quantity || 0,
        notes: `Dibuat otomatis dari Machine Queue: ${queueData.queueId}`
      });
    }

    // Update status feedback berdasarkan status antrian
    let feedbackStatus = feedback.status;
    let notificationType = 'status_change';
    let notificationTitle = '';
    let notificationMessage = '';

    switch (queueData.status) {
      case 'in_progress':
        feedbackStatus = 'in_production';
        notificationTitle = 'Produksi Dimulai';
        notificationMessage = `Produksi untuk ${queueData.productName} (Batch: ${queueData.batchId}) telah dimulai.`;
        break;
      case 'completed':
        feedbackStatus = 'completed';
        notificationTitle = 'Produksi Selesai';
        notificationMessage = `Produksi untuk ${queueData.productName} (Batch: ${queueData.batchId}) telah selesai.`;
        break;
      case 'paused':
        feedbackStatus = 'on_hold';
        notificationTitle = 'Produksi Ditunda';
        notificationMessage = `Produksi untuk ${queueData.productName} (Batch: ${queueData.batchId}) sedang ditunda.`;
        break;
      case 'cancelled':
        feedbackStatus = 'cancelled';
        notificationTitle = 'Produksi Dibatalkan';
        notificationMessage = `Produksi untuk ${queueData.productName} (Batch: ${queueData.batchId}) telah dibatalkan.`;
        break;
      default:
        // Tidak perlu update status jika tidak ada perubahan yang relevan
        return;
    }

    // Update feedback dengan status baru
    await feedback.update({
      status: feedbackStatus,
      startDate: queueData.actualStartTime || feedback.startDate,
      endDate: queueData.actualEndTime || feedback.endDate,
      actualQuantity: queueData.completedQuantity || feedback.actualQuantity
    });

    // Buat notifikasi untuk perubahan status
    await createNotification(
      feedback.feedbackId,
      notificationType,
      notificationTitle,
      notificationMessage,
      'all', // Kirim ke semua pengguna yang terkait
      null,
      'medium'
    );

    console.log(`Berhasil memproses pesan dan membuat notifikasi untuk ${queueData.batchId}`);
  } catch (error) {
    console.error('Error memproses pesan dari Machine Queue:', error);
  }
};

/**
 * Fungsi untuk memulai consumer
 * @returns {Promise<void>}
 */
const startConsumer = async () => {
  try {
    console.log(`Menghubungkan ke RabbitMQ di ${rabbitMqUrl}...`);
    const connection = await amqp.connect(rabbitMqUrl);
    const channel = await connection.createChannel();

    // Pastikan queue sudah ada
    await channel.assertQueue(queueName, { durable: true });
    console.log(`Terhubung ke queue: ${queueName}`);

    // Konsumsi pesan dari queue
    channel.consume(queueName, async (message) => {
      if (message) {
        await processQueueMessage(message);
        channel.ack(message); // Acknowledge pesan setelah diproses
      }
    });

    console.log('Consumer Machine Queue berhasil dimulai');

    // Tangani penutupan koneksi
    process.on('SIGINT', async () => {
      await channel.close();
      await connection.close();
      console.log('Consumer Machine Queue dihentikan');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error memulai consumer Machine Queue:', error);
    // Coba lagi setelah 5 detik jika terjadi error
    setTimeout(startConsumer, 5000);
  }
};

module.exports = {
  startConsumer,
  processQueueMessage, // Export untuk keperluan testing
  createNotification
};