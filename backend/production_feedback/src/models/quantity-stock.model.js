/**
 * Model untuk QuantityStock
 * 
 * Mendefinisikan struktur tabel quantity_stock
 */
module.exports = (sequelize, DataTypes) => {
  const QuantityStock = sequelize.define('QuantityStock', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'product_name'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reorderPoint: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'reorder_point'
    },
    status: {
      type: DataTypes.ENUM('received', 'cancelled', 'in_transit', 'returned'),
      allowNull: false,
      defaultValue: 'received'
    }
  }, {
    tableName: 'quantity_stock',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'idx_product_name',
        fields: ['product_name']
      }
    ]
  });


  // Definisi asosiasi
  QuantityStock.associate = (models) => {
    QuantityStock.belongsTo(models.ProductionFeedback, {
      foreignKey: 'product_name',
      targetKey: 'productName',
      as: 'feedback'
    });
  };

  return QuantityStock;
};