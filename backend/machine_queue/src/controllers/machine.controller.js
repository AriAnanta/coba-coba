/**
 * Controller Machine
 * 
 * Mengelola operasi terkait mesin produksi
 */
const { Machine, MachineQueue } = require('../models');
const { Op } = require('sequelize');

/**
 * Mendapatkan semua data mesin
 */
exports.getAllMachines = async (req, res) => {
  try {
    const { status } = req.query;
    const whereCondition = status ? { status } : {};
    
    const machines = await Machine.findAll({
      where: whereCondition,
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json(machines);
  } catch (error) {
    console.error('Error mengambil data mesin:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Kesalahan server internal' 
    });
  }
};

/**
 * Mendapatkan detail mesin berdasarkan ID
 */
exports.getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id, {
      include: [
        {
          model: MachineQueue,
          as: 'queues',
          where: {
            status: {
              [Op.ne]: 'completed'
            }
          },
          required: false,
          order: [['position', 'ASC']]
        }
      ]
    });
    
    if (!machine) {
      return res.status(404).json({ message: 'Mesin tidak ditemukan' });
    }
    
    return res.status(200).json(machine);
  } catch (error) {
    console.error('Error mengambil detail mesin:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Mendapatkan mesin berdasarkan tipe
 */
exports.getMachinesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const machines = await Machine.findAll({
      where: {
        type,
        status: 'operational'
      },
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json(machines);
  } catch (error) {
    console.error('Error mengambil mesin berdasarkan tipe:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Mendapatkan semua tipe mesin yang tersedia
 */
exports.getMachineTypes = async (req, res) => {
  try {
    const types = await Machine.findAll({
      attributes: [[Machine.sequelize.fn('DISTINCT', Machine.sequelize.col('type')), 'type']],
      order: [['type', 'ASC']]
    });
    
    return res.status(200).json(types.map(t => t.type));
  } catch (error) {
    console.error('Error mengambil tipe mesin:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Mendapatkan mesin yang dibutuhkan untuk suatu produk
 */
exports.getMachinesForProduct = async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ message: 'Nama produk diperlukan' });
    }
    
    // Implementasi sederhana: kembalikan semua mesin yang operational
    // Untuk implementasi yang lebih canggih, data mesin yang dibutuhkan untuk
    // setiap produk dapat disimpan dalam tabel terpisah atau diambil dari system lain
    const machines = await Machine.findAll({
      where: {
        status: 'operational'
      },
      order: [['type', 'ASC'], ['name', 'ASC']]
    });
    
    return res.status(200).json(machines);
  } catch (error) {
    console.error('Error mengambil mesin untuk produk:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Generate unique machine ID
 */
exports.generateMachineId = async (req, res) => {
  try {
    // Get the latest machine to determine the next sequence number
    const latestMachine = await Machine.findOne({
      where: {
        machine_id: {
          [Op.like]: 'MACHINE-%'
        }
      },
      order: [['created_at', 'DESC']]
    });
    
    let nextSequence = 1;
    
    if (latestMachine && latestMachine.machine_id) {
      // Extract sequence number from the latest machine ID
      const match = latestMachine.machine_id.match(/MACHINE-(\d+)/);
      if (match) {
        nextSequence = parseInt(match[1]) + 1;
      }
    }
    
    // Format sequence number with leading zeros (3 digits)
    const formattedSequence = nextSequence.toString().padStart(3, '0');
    const newMachineId = `MACHINE-${formattedSequence}`;
    
    // Verify uniqueness
    const existing = await Machine.findOne({
      where: { machine_id: newMachineId }
    });
    
    if (existing) {
      // If somehow exists, use timestamp-based ID as fallback
      const timestamp = Date.now().toString().slice(-6);
      const fallbackId = `MACHINE-${timestamp}`;
      return res.status(200).json({
        success: true,
        machineId: fallbackId
      });
    }
    
    return res.status(200).json({
      success: true,
      machineId: newMachineId
    });
  } catch (error) {
    console.error('Error generating machine ID:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to generate machine ID' 
    });
  }
};

/**
 * Membuat mesin baru
 */
exports.createMachine = async (req, res) => {
  try {
    const {
      machineId,
      name,
      type,
      manufacturer,
      modelNumber,
      capacity,
      capacityUnit,
      location,
      installationDate,
      lastMaintenance,
      nextMaintenance,
      hoursPerDay,
      notes
    } = req.body;
    
    // Validasi data masukan
    if (!name || !type) {
      return res.status(400).json({ 
        success: false,
        message: 'Nama dan tipe mesin diperlukan' 
      });
    }
    
    // Use provided machineId or generate new one
    let finalMachineId = machineId;
    if (!finalMachineId) {
      const latestMachine = await Machine.findOne({
        where: {
          machine_id: {
            [Op.like]: 'MACHINE-%'
          }
        },
        order: [['created_at', 'DESC']]
      });
      
      let nextSequence = 1;
      if (latestMachine && latestMachine.machine_id) {
        const match = latestMachine.machine_id.match(/MACHINE-(\d+)/);
        if (match) {
          nextSequence = parseInt(match[1]) + 1;
        }
      }
      
      finalMachineId = `MACHINE-${nextSequence.toString().padStart(3, '0')}`;
    }
    
    // Buat mesin baru dengan field names yang sesuai database
    const newMachine = await Machine.create({
      machine_id: finalMachineId,
      name,
      type,
      manufacturer,
      model_number: modelNumber,
      capacity: capacity ? parseFloat(capacity) : null,
      capacity_unit: capacityUnit,
      location,
      installation_date: installationDate ? new Date(installationDate) : null,
      last_maintenance: lastMaintenance ? new Date(lastMaintenance) : null,
      next_maintenance: nextMaintenance ? new Date(nextMaintenance) : null,
      hours_per_day: hoursPerDay ? parseFloat(hoursPerDay) : 8.0,
      status: 'operational',
      notes
    });
    
    return res.status(201).json({
      success: true,
      message: 'Mesin berhasil dibuat',
      data: newMachine
    });
  } catch (error) {
    console.error('Error membuat mesin:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Kesalahan server internal' 
    });
  }
};

/**
 * Memperbarui mesin
 */
exports.updateMachine = async (req, res) => {
  try {
    const machineId = req.params.id;
    const {
      name,
      type,
      manufacturer,
      modelNumber,
      capacity,
      capacityUnit,
      location,
      installationDate,
      lastMaintenance,
      nextMaintenance,
      status,
      hoursPerDay,
      notes
    } = req.body;
    
    // Cari mesin
    const machine = await Machine.findByPk(machineId);
    
    if (!machine) {
      return res.status(404).json({ 
        success: false,
        message: 'Mesin tidak ditemukan' 
      });
    }
    
    // Update bidang dengan field names yang sesuai database
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (modelNumber !== undefined) updateData.model_number = modelNumber;
    if (capacity !== undefined) updateData.capacity = capacity ? parseFloat(capacity) : null;
    if (capacityUnit !== undefined) updateData.capacity_unit = capacityUnit;
    if (location !== undefined) updateData.location = location;
    if (installationDate !== undefined) updateData.installation_date = installationDate ? new Date(installationDate) : null;
    if (lastMaintenance !== undefined) updateData.last_maintenance = lastMaintenance ? new Date(lastMaintenance) : null;
    if (nextMaintenance !== undefined) updateData.next_maintenance = nextMaintenance ? new Date(nextMaintenance) : null;
    if (status !== undefined) updateData.status = status;
    if (hoursPerDay !== undefined) updateData.hours_per_day = hoursPerDay ? parseFloat(hoursPerDay) : null;
    if (notes !== undefined) updateData.notes = notes;
    
    // Update mesin
    await machine.update(updateData);
    
    // Reload machine with fresh data
    await machine.reload();
    
    return res.status(200).json({
      success: true,
      message: 'Mesin berhasil diperbarui',
      data: machine
    });
  } catch (error) {
    console.error('Error memperbarui mesin:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Kesalahan server internal' 
    });
  }
};

/**
 * Menghapus mesin
 */
exports.deleteMachine = async (req, res) => {
  try {
    const machineId = req.params.id;
    
    // Cari mesin
    const machine = await Machine.findByPk(machineId);
    
    if (!machine) {
      return res.status(404).json({ 
        success: false,
        message: 'Mesin tidak ditemukan' 
      });
    }
    
    // Periksa apakah mesin memiliki antrian aktif - Fix column name here
    const activeQueues = await MachineQueue.count({
      where: {
        machine_id: machine.id, // Changed from machineId to machine_id
        status: {
          [Op.in]: ['waiting', 'in_progress']
        }
      }
    });
    
    if (activeQueues > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Tidak dapat menghapus mesin dengan antrian aktif',
        activeQueues
      });
    }
    
    // Hapus mesin
    await machine.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Mesin berhasil dihapus'
    });
  } catch (error) {
    console.error('Error menghapus mesin:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Kesalahan server internal' 
    });
  }
};

/**
 * Memeriksa ketersediaan kapasitas mesin
 */
exports.checkCapacity = async (req, res) => {
  try {
    const {
      machineType,
      hoursRequired,
      startDate,
      endDate
    } = req.body;
    
    if (!machineType || !hoursRequired) {
      return res.status(400).json({ message: 'Tipe mesin dan jam yang dibutuhkan diperlukan' });
    }
    
    // Dapatkan semua mesin dengan tipe yang diminta dan status operational
    const machines = await Machine.findAll({
      where: {
        type: machineType,
        status: 'operational'
      }
    });
    
    if (machines.length === 0) {
      return res.status(200).json({
        available: false,
        message: `Tidak ada mesin ${machineType} yang tersedia`,
        machines: []
      });
    }
    
    // Untuk setiap mesin, periksa ketersediaan pada rentang waktu yang diminta
    const availableMachines = [];
    const unavailableMachines = [];
    
    const requestedStart = startDate ? new Date(startDate) : new Date();
    const requestedEnd = endDate ? new Date(endDate) : new Date(requestedStart.getTime() + hoursRequired * 60 * 60 * 1000);
    
    for (const machine of machines) {
      // Dapatkan semua antrian yang tumpang tindih dengan rentang waktu yang diminta - Fix column name here too
      const overlappingQueues = await MachineQueue.findAll({
        where: {
          machine_id: machine.id, // Changed from machineId to machine_id
          status: {
            [Op.in]: ['waiting', 'in_progress']
          },
          [Op.or]: [
            {
              scheduledStartTime: {
                [Op.between]: [requestedStart, requestedEnd]
              }
            },
            {
              scheduledEndTime: {
                [Op.between]: [requestedStart, requestedEnd]
              }
            },
            {
              [Op.and]: [
                {
                  scheduledStartTime: {
                    [Op.lte]: requestedStart
                  }
                },
                {
                  scheduledEndTime: {
                    [Op.gte]: requestedEnd
                  }
                }
              ]
            }
          ]
        }
      });
      
      if (overlappingQueues.length === 0) {
        // Mesin tersedia
        availableMachines.push({
          id: machine.id,
          name: machine.name,
          capacity: machine.capacity,
          capacityUnit: machine.capacity_unit, // Fix column name
          hoursPerDay: machine.hours_per_day // Fix column name
        });
      } else {
        // Mesin tidak tersedia pada rentang waktu yang diminta
        unavailableMachines.push({
          id: machine.id,
          name: machine.name,
          conflictingQueues: overlappingQueues.length
        });
      }
    }
    
    // Jika ada mesin yang tersedia, kembalikan true
    if (availableMachines.length > 0) {
      return res.status(200).json({
        available: true,
        message: `${availableMachines.length} mesin ${machineType} tersedia`,
        machines: availableMachines
      });
    } else {
      // Tidak ada mesin yang tersedia pada rentang waktu yang diminta
      return res.status(200).json({
        available: false,
        message: `Semua mesin ${machineType} sudah dijadwalkan pada rentang waktu yang diminta`,
        unavailableMachines
      });
    }
  } catch (error) {
    console.error('Error memeriksa kapasitas mesin:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};

/**
 * Update machine status with business logic validation
 */
exports.updateMachineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, scheduledMaintenanceDate, estimatedDowntime } = req.body;
    
    const machine = await Machine.findByPk(id);
    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Mesin tidak ditemukan'
      });
    }

    const currentStatus = machine.status;
    const validTransitions = {
      'operational': ['maintenance', 'breakdown', 'inactive'],
      'maintenance': ['operational', 'breakdown'],
      'breakdown': ['maintenance', 'inactive'],
      'inactive': ['operational', 'maintenance']
    };

    // Validate status transition
    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${status}`
      });
    }

    // Check if machine has active queues when setting to non-operational
    if (status !== 'operational') {
      const activeQueues = await MachineQueue.count({
        where: {
          machine_id: machine.id,
          status: {
            [Op.in]: ['waiting', 'in_progress']
          }
        }
      });

      if (activeQueues > 0) {
        // Move waiting jobs to other machines or pause them
        await this.handleActiveQueuesOnStatusChange(machine.id, status);
      }
    }

    // Update machine status with additional info
    const updateData = {
      status,
      notes: reason ? `${machine.notes || ''}\n[${new Date().toISOString()}] Status changed to ${status}: ${reason}` : machine.notes
    };

    if (status === 'maintenance' && scheduledMaintenanceDate) {
      updateData.last_maintenance = new Date();
      updateData.next_maintenance = new Date(scheduledMaintenanceDate);
    }

    await machine.update(updateData);

    // Log status change
    await this.logStatusChange(machine.id, currentStatus, status, reason);

    return res.status(200).json({
      success: true,
      message: `Machine status updated to ${status}`,
      data: machine
    });

  } catch (error) {
    console.error('Error updating machine status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update machine status'
    });
  }
};

/**
 * Handle active queues when machine status changes to non-operational
 */
exports.handleActiveQueuesOnStatusChange = async (machineId, newStatus) => {
  try {
    const activeQueues = await MachineQueue.findAll({
      where: {
        machine_id: machineId,
        status: {
          [Op.in]: ['waiting', 'in_progress']
        }
      }
    });

    for (const queue of activeQueues) {
      if (queue.status === 'in_progress') {
        // Pause current job
        await queue.update({
          status: 'paused',
          notes: `${queue.notes || ''}\n[${new Date().toISOString()}] Job paused due to machine ${newStatus}`
        });
      } else if (queue.status === 'waiting') {
        // Try to reassign to another machine of same type
        const alternativeMachine = await Machine.findOne({
          where: {
            type: { [Op.in]: [
              Machine.sequelize.literal(`(SELECT type FROM machines WHERE id = ${machineId})`)
            ]},
            status: 'operational',
            id: { [Op.ne]: machineId }
          }
        });

        if (alternativeMachine) {
          // Get next position in alternative machine queue
          const maxPosition = await MachineQueue.max('position', {
            where: {
              machine_id: alternativeMachine.id,
              status: 'waiting'
            }
          }) || 0;

          await queue.update({
            machine_id: alternativeMachine.id,
            position: maxPosition + 1,
            notes: `${queue.notes || ''}\n[${new Date().toISOString()}] Reassigned from machine ${machineId} due to ${newStatus}`
          });
        } else {
          // No alternative machine available, pause the job
          await queue.update({
            status: 'paused',
            notes: `${queue.notes || ''}\n[${new Date().toISOString()}] Paused - no alternative machine available`
          });
        }
      }
    }
  } catch (error) {
    console.error('Error handling active queues:', error);
    throw error;
  }
};

/**
 * Log status changes for audit trail
 */
exports.logStatusChange = async (machineId, oldStatus, newStatus, reason) => {
  try {
    // Insert into audit log table if you have one
    // For now, we'll just log to console
    console.log(`Machine ${machineId} status changed: ${oldStatus} -> ${newStatus}. Reason: ${reason}`);
  } catch (error) {
    console.error('Error logging status change:', error);
  }
};

/**
 * Check machines that need maintenance
 */
exports.checkMaintenanceSchedule = async (req, res) => {
  try {
    const today = new Date();
    const upcomingDays = parseInt(req.query.days) || 7; // Default 7 days ahead
    const upcomingDate = new Date(today.getTime() + (upcomingDays * 24 * 60 * 60 * 1000));

    const machinesNeedingMaintenance = await Machine.findAll({
      where: {
        [Op.or]: [
          {
            next_maintenance: {
              [Op.lte]: upcomingDate,
              [Op.gte]: today
            }
          },
          {
            next_maintenance: {
              [Op.lt]: today
            }
          }
        ],
        status: {
          [Op.ne]: 'maintenance'
        }
      },
      order: [['next_maintenance', 'ASC']]
    });

    const overdue = machinesNeedingMaintenance.filter(m => 
      m.next_maintenance && new Date(m.next_maintenance) < today
    );

    const upcoming = machinesNeedingMaintenance.filter(m => 
      m.next_maintenance && new Date(m.next_maintenance) >= today
    );

    return res.status(200).json({
      success: true,
      data: {
        overdue: overdue.length,
        upcoming: upcoming.length,
        machines: {
          overdue,
          upcoming
        }
      }
    });

  } catch (error) {
    console.error('Error checking maintenance schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check maintenance schedule'
    });
  }
};

/**
 * Auto-update machine status based on maintenance schedule
 */
exports.autoUpdateMaintenanceStatus = async () => {
  try {
    const today = new Date();
    
    // Mark overdue machines for maintenance
    const overdueMachines = await Machine.findAll({
      where: {
        next_maintenance: {
          [Op.lt]: today
        },
        status: 'operational'
      }
    });

    for (const machine of overdueMachines) {
      await machine.update({
        status: 'maintenance',
        notes: `${machine.notes || ''}\n[${today.toISOString()}] Auto-scheduled for overdue maintenance`
      });

      // Handle active queues
      await this.handleActiveQueuesOnStatusChange(machine.id, 'maintenance');
      
      console.log(`Machine ${machine.name} (${machine.machine_id}) automatically scheduled for maintenance`);
    }

    return {
      success: true,
      updated: overdueMachines.length,
      machines: overdueMachines.map(m => m.machine_id)
    };

  } catch (error) {
    console.error('Error in auto-update maintenance status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get machine utilization and status summary
 */
exports.getMachineStatusSummary = async (req, res) => {
  try {
    const summary = await Machine.findAll({
      attributes: [
        'status',
        [Machine.sequelize.fn('COUNT', Machine.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const statusMap = {
      operational: 0,
      maintenance: 0,
      breakdown: 0,
      inactive: 0
    };

    summary.forEach(item => {
      statusMap[item.status] = parseInt(item.count);
    });

    const total = Object.values(statusMap).reduce((sum, count) => sum + count, 0);
    const utilizationRate = total > 0 ? (statusMap.operational / total) * 100 : 0;

    return res.status(200).json({
      success: true,
      data: {
        summary: statusMap,
        total,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        alerts: {
          needMaintenance: await this.getMaintenanceAlerts(),
          breakdown: statusMap.breakdown,
          inactive: statusMap.inactive
        }
      }
    });

  } catch (error) {
    console.error('Error getting machine status summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get status summary'
    });
  }
};

/**
 * Helper function to get maintenance alerts
 */
exports.getMaintenanceAlerts = async () => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));

    const alerts = await Machine.count({
      where: {
        next_maintenance: {
          [Op.lte]: sevenDaysFromNow
        },
        status: {
          [Op.ne]: 'maintenance'
        }
      }
    });

    return alerts;
  } catch (error) {
    console.error('Error getting maintenance alerts:', error);
    return 0;
  }
};

/**
 * Mendapatkan mesin berdasarkan status
 */
exports.getMachinesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const machines = await Machine.findAll({
      where: { status },
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json(machines);
  } catch (error) {
    console.error('Error mengambil mesin berdasarkan status:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};
