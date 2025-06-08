/**
 * Model FeedbackImage untuk Production Feedback Service
 * 
 * Merepresentasikan gambar/foto yang terkait dengan produksi
 */
module.exports = (sequelize, DataTypes) => {
  const FeedbackImage = sequelize.define('FeedbackImage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    imageId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'ID unik untuk gambar'
    },
    feedbackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID referensi ke ProductionFeedback'
    },
    stepId: {
      type: DataTypes.INTEGER,
      comment: 'ID referensi ke ProductionStep (opsional)'
    },
    qualityCheckId: {
      type: DataTypes.INTEGER,
      comment: 'ID referensi ke QualityCheck (opsional)'
    },
    imageType: {
      type: DataTypes.ENUM('product', 'process', 'defect', 'quality_check', 'other'),
      allowNull: false,
      defaultValue: 'product',
      comment: 'Jenis gambar'
    },
    title: {
      type: DataTypes.STRING(255),
      comment: 'Judul atau nama gambar'
    },
    description: {
      type: DataTypes.TEXT,
      comment: 'Deskripsi gambar'
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Path file gambar'
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      comment: 'URL akses gambar'
    },
    fileType: {
      type: DataTypes.STRING(50),
      comment: 'Tipe file (mime type)'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      comment: 'Ukuran file dalam bytes'
    },
    uploadedBy: {
      type: DataTypes.STRING(50),
      comment: 'ID pengguna yang mengunggah gambar'
    },
    uploadDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Tanggal unggah gambar'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Apakah gambar dapat dilihat oleh customer/marketplace'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Catatan tambahan tentang gambar'
    }
  }, {
    tableName: 'feedback_images',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['imageId']
      },
      {
        fields: ['feedbackId']
      },
      {
        fields: ['stepId']
      },
      {
        fields: ['qualityCheckId']
      }
    ]
  });

  FeedbackImage.associate = (models) => {
    // Relasi dengan ProductionFeedback (banyak gambar milik satu feedback)
    FeedbackImage.belongsTo(models.ProductionFeedback, {
      foreignKey: 'feedbackId',
      as: 'productionFeedback'
    });

    // Relasi dengan ProductionStep (banyak gambar milik satu langkah produksi)
    FeedbackImage.belongsTo(models.ProductionStep, {
      foreignKey: 'stepId',
      as: 'productionStep'
    });

    // Relasi dengan QualityCheck (banyak gambar milik satu pemeriksaan kualitas)
    FeedbackImage.belongsTo(models.QualityCheck, {
      foreignKey: 'qualityCheckId',
      as: 'qualityCheck'
    });
  };

  return FeedbackImage;
};
