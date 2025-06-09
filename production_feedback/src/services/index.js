// /**
//  * Services Index
//  * 
//  * File ini mengekspor semua layanan yang tersedia dalam aplikasi
//  * dan menyediakan fungsi untuk menginisialisasi layanan-layanan tersebut.
//  */
// const { startConsumer } = require('./consumer');

// /**
//  * Fungsi untuk menginisialisasi semua layanan
//  * @returns {Promise<void>}
//  */
// const initializeServices = async () => {
//   try {
//     console.log('Menginisialisasi layanan...');
    
//     // Mulai consumer untuk Machine Queue
//     await startConsumer();
    
//     console.log('Semua layanan berhasil diinisialisasi');
//   } catch (error) {
//     console.error('Error saat menginisialisasi layanan:', error);
//     throw error;
//   }
// };

// module.exports = {
//   initializeServices,
//   consumer: require('./consumer')
// };