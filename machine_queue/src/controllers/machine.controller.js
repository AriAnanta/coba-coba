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
    const machines = await Machine.findAll({
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
 * Membuat mesin baru
 */
exports.createMachine = async (req, res) => {
  try {
    const {
      name,
      type,
      manufacturer,
      modelNumber,
      capacity,
      capacityUnit,
      location,
      installationDate,
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
    
    // Buat ID mesin unik
    const machineId = `MCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Buat mesin baru dengan field names yang sesuai database
    const newMachine = await Machine.create({
      machine_id: machineId,
      name,
      type,
      manufacturer,
      model_number: modelNumber,
      capacity,
      capacity_unit: capacityUnit,
      location,
      installation_date: installationDate ? new Date(installationDate) : null,
      hours_per_day: hoursPerDay || 8.0,
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
    if (capacity !== undefined) updateData.capacity = capacity;
    if (capacityUnit !== undefined) updateData.capacity_unit = capacityUnit;
    if (location !== undefined) updateData.location = location;
    if (installationDate !== undefined) updateData.installation_date = installationDate ? new Date(installationDate) : null;
    if (lastMaintenance !== undefined) updateData.last_maintenance = lastMaintenance ? new Date(lastMaintenance) : null;
    if (nextMaintenance !== undefined) updateData.next_maintenance = nextMaintenance ? new Date(nextMaintenance) : null;
    if (status !== undefined) updateData.status = status;
    if (hoursPerDay !== undefined) updateData.hours_per_day = hoursPerDay;
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
    
    // Periksa apakah mesin memiliki antrian aktif
    const activeQueues = await MachineQueue.count({
      where: {
        machineId: machine.id,
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
      // Dapatkan semua antrian yang tumpang tindih dengan rentang waktu yang diminta
      const overlappingQueues = await MachineQueue.findAll({
        where: {
          machineId: machine.id,
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
          capacityUnit: machine.capacityUnit,
          hoursPerDay: machine.hoursPerDay
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
