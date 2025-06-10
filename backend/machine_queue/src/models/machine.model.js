/**
 * Model Machine
 * 
 * Merepresentasikan data mesin produksi
 */
module.exports = (sequelize, DataTypes) => {
  const Machine = sequelize.define('Machine', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    machine_id: {
      type: DataTypes.STRING(50),
      field: 'machine_id',
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    manufacturer: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    model_number: {
      type: DataTypes.STRING(100),
      field: 'model_number',
      allowNull: true
    },
    capacity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Kapasitas dalam satuan yang sesuai untuk tipe mesin'
    },
    capacity_unit: {
      type: DataTypes.STRING(20),
      field: 'capacity_unit',
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    installation_date: {
      type: DataTypes.DATE,
      field: 'installation_date',
      allowNull: true
    },
    last_maintenance: {
      type: DataTypes.DATE,
      field: 'last_maintenance',
      allowNull: true
    },
    next_maintenance: {
      type: DataTypes.DATE,
      field: 'next_maintenance',
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('operational', 'maintenance', 'breakdown', 'inactive'),
      defaultValue: 'operational'
    },
    hours_per_day: {
      type: DataTypes.DECIMAL(4, 2),
      field: 'hours_per_day',
      allowNull: false,
      defaultValue: 8.00,
      comment: 'Jam kerja mesin per hari'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'machines',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Virtual getters untuk backward compatibility dengan frontend
  Machine.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Map snake_case to camelCase for frontend compatibility
    return {
      id: values.id,
      machineId: values.machine_id,
      name: values.name,
      type: values.type,
      manufacturer: values.manufacturer,
      modelNumber: values.model_number,
      capacity: values.capacity,
      capacityUnit: values.capacity_unit,
      location: values.location,
      installationDate: values.installation_date,
      lastMaintenance: values.last_maintenance,
      nextMaintenance: values.next_maintenance,
      status: values.status,
      hoursPerDay: values.hours_per_day,
      notes: values.notes,
      createdAt: values.created_at,
      updatedAt: values.updated_at,
      queues: values.queues
    };
  };

  // Definisi asosiasi
  Machine.associate = (models) => {
    Machine.hasMany(models.MachineQueue, {
      foreignKey: 'machine_id',
      as: 'queues'
    });
  };

  return Machine;
};
