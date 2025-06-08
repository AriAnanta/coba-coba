/**
 * Model FeedbackNotification untuk Production Feedback Service
 * 
 * Merepresentasikan notifikasi terkait dengan produksi
 */
module.exports = (sequelize, DataTypes) => {
  const FeedbackNotification = sequelize.define('FeedbackNotification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    notificationId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'ID unik untuk notifikasi'
    },
    feedbackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID referensi ke ProductionFeedback'
    },
    type: {
      type: DataTypes.ENUM('status_update', 'quality_issue', 'completion', 'comment', 'marketplace_update', 'other'),
      allowNull: false,
      comment: 'Jenis notifikasi'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Judul notifikasi'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Isi pesan notifikasi'
    },
    recipientType: {
      type: DataTypes.ENUM('user', 'role', 'customer', 'marketplace', 'all'),
      allowNull: false,
      comment: 'Jenis penerima notifikasi'
    },
    recipientId: {
      type: DataTypes.STRING(50),
      comment: 'ID penerima (user ID atau role)'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
      comment: 'Prioritas notifikasi'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Apakah notifikasi sudah dibaca'
    },
    readAt: {
      type: DataTypes.DATE,
      comment: 'Waktu notifikasi dibaca'
    },
    isDelivered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Apakah notifikasi berhasil dikirim'
    },
    deliveryMethod: {
      type: DataTypes.ENUM('in_app', 'email', 'sms', 'push', 'api'),
      allowNull: false,
      defaultValue: 'in_app',
      comment: 'Metode pengiriman notifikasi'
    },
    deliveryStatus: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Status pengiriman notifikasi'
    },
    actionUrl: {
      type: DataTypes.STRING(500),
      comment: 'URL tindakan terkait notifikasi'
    },
    expiresAt: {
      type: DataTypes.DATE,
      comment: 'Waktu kedaluwarsa notifikasi'
    }
  }, {
    tableName: 'feedback_notifications',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['notificationId']
      },
      {
        fields: ['feedbackId']
      },
      {
        fields: ['recipientId']
      },
      {
        fields: ['isRead']
      }
    ]
  });

  FeedbackNotification.associate = (models) => {
    // Relasi dengan ProductionFeedback (banyak notifikasi milik satu feedback)
    FeedbackNotification.belongsTo(models.ProductionFeedback, {
      foreignKey: 'feedbackId',
      as: 'productionFeedback'
    });
  };

  return FeedbackNotification;
};
