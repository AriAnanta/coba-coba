/**
 * Model FeedbackComment untuk Production Feedback Service
 * 
 * Merepresentasikan komentar yang terkait dengan produksi
 */
module.exports = (sequelize, DataTypes) => {
  const FeedbackComment = sequelize.define('FeedbackComment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    commentId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'ID unik untuk komentar'
    },
    feedbackId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID referensi ke ProductionFeedback'
    },
    commentType: {
      type: DataTypes.ENUM('internal', 'customer', 'marketplace', 'system'),
      allowNull: false,
      defaultValue: 'internal',
      comment: 'Jenis komentar'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Isi komentar'
    },
    userId: {
      type: DataTypes.STRING(50),
      comment: 'ID pengguna yang membuat komentar'
    },
    userName: {
      type: DataTypes.STRING(255),
      comment: 'Nama pengguna yang membuat komentar'
    },
    userRole: {
      type: DataTypes.STRING(50),
      comment: 'Peran pengguna yang membuat komentar'
    },
    isImportant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Apakah komentar penting/mendesak'
    },
    parentCommentId: {
      type: DataTypes.INTEGER,
      comment: 'ID komentar induk jika ini adalah balasan'
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Apakah komentar pernah diedit'
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Apakah komentar telah dihapus'
    },
    visibleToCustomer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Apakah komentar dapat dilihat oleh pelanggan'
    },
    visibleToMarketplace: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Apakah komentar dapat dilihat oleh marketplace'
    }
  }, {
    tableName: 'feedback_comments',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['commentId']
      },
      {
        fields: ['feedbackId']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['parentCommentId']
      }
    ]
  });

  FeedbackComment.associate = (models) => {
    // Relasi dengan ProductionFeedback (banyak komentar milik satu feedback)
    FeedbackComment.belongsTo(models.ProductionFeedback, {
      foreignKey: 'feedbackId',
      as: 'productionFeedback'
    });

    // Self-relation untuk komentar balasan
    FeedbackComment.belongsTo(models.FeedbackComment, {
      foreignKey: 'parentCommentId',
      as: 'parentComment'
    });
    
    FeedbackComment.hasMany(models.FeedbackComment, {
      foreignKey: 'parentCommentId',
      as: 'replies'
    });
  };

  return FeedbackComment;
};
