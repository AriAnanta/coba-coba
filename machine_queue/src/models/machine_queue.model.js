/**
 * Model Machine Queue
 * 
 * Merepresentasikan antrian pekerjaan pada mesin produksi
 */
module.exports = (sequelize, DataTypes) => {
  const MachineQueue = sequelize.define('MachineQueue', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    queue_id: {
      type: DataTypes.STRING(50),
      field: 'queue_id',
      allowNull: false,
      unique: true
    },
    machine_id: {
      type: DataTypes.INTEGER,
      field: 'machine_id',
      allowNull: false,
      references: {
        model: 'machines',
        key: 'id'
      }
    },
    batch_id: {
      type: DataTypes.INTEGER,
      field: 'batch_id',
      allowNull: false,
      comment: 'ID referensi ke batch di production_management service'
    },
    batch_number: {
      type: DataTypes.STRING(50),
      field: 'batch_number',
      allowNull: false,
      comment: 'Batch number dari production_management service'
    },
    product_name: {
      type: DataTypes.STRING(100),
      field: 'product_name',
      allowNull: false
    },
    step_id: {
      type: DataTypes.INTEGER,
      field: 'step_id',
      allowNull: true,
      comment: 'ID referensi ke step di production_management service'
    },
    step_name: {
      type: DataTypes.STRING(100),
      field: 'step_name',
      allowNull: true
    },
    scheduled_start_time: {
      type: DataTypes.DATE,
      field: 'scheduled_start_time',
      allowNull: true
    },
    scheduled_end_time: {
      type: DataTypes.DATE,
      field: 'scheduled_end_time',
      allowNull: true
    },
    actual_start_time: {
      type: DataTypes.DATE,
      field: 'actual_start_time',
      allowNull: true
    },
    actual_end_time: {
      type: DataTypes.DATE,
      field: 'actual_end_time',
      allowNull: true
    },
    hours_required: {
      type: DataTypes.DECIMAL(6, 2),
      field: 'hours_required',
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    status: {
      type: DataTypes.ENUM('waiting', 'in_progress', 'completed', 'paused', 'cancelled'),
      defaultValue: 'waiting'
    },
    operator_id: {
      type: DataTypes.STRING(100),
      field: 'operator_id',
      allowNull: true
    },
    operator_name: {
      type: DataTypes.STRING(100),
      field: 'operator_name',
      allowNull: true
    },
    setup_time: {
      type: DataTypes.DECIMAL(6, 2),
      field: 'setup_time',
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Waktu setup dalam jam'
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Posisi dalam antrian (0 = sedang dikerjakan)'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'machine_queues',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Virtual getters untuk backward compatibility dengan frontend
  MachineQueue.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Map snake_case to camelCase for frontend compatibility
    return {
      id: values.id,
      queueId: values.queue_id,
      machineId: values.machine_id,
      batchId: values.batch_id,
      batchNumber: values.batch_number,
      productName: values.product_name,
      stepId: values.step_id,
      stepName: values.step_name,
      scheduledStartTime: values.scheduled_start_time,
      scheduledEndTime: values.scheduled_end_time,
      actualStartTime: values.actual_start_time,
      actualEndTime: values.actual_end_time,
      hoursRequired: values.hours_required,
      priority: values.priority,
      status: values.status,
      operatorId: values.operator_id,
      operatorName: values.operator_name,
      setupTime: values.setup_time,
      position: values.position,
      notes: values.notes,
      createdAt: values.created_at,
      updatedAt: values.updated_at,
      machine: values.machine
    };
  };

  // Definisi asosiasi
  MachineQueue.associate = (models) => {
    MachineQueue.belongsTo(models.Machine, {
      foreignKey: 'machine_id',
      as: 'machine'
    });
  };

  return MachineQueue;
};
