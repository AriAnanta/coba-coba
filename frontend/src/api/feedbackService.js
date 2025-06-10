// import axios from "axios";

// const FEEDBACK_API_URL = "http://localhost:5002/api";

// const feedbackService = {
//   // Feedback management
//   getAllFeedback: async () => {
//     const response = await axios.get(`${FEEDBACK_API_URL}/feedback`);
//     return response.data;
//   },

//   getFeedbackById: async (id) => {
//     const response = await axios.get(`${FEEDBACK_API_URL}/feedback/${id}`);
//     return response.data;
//   },

//   createFeedback: async (feedbackData) => {
//     const response = await axios.post(`${FEEDBACK_API_URL}/feedback`, feedbackData);
//     return response.data;
//   },

//   updateFeedback: async (id, feedbackData) => {
//     const response = await axios.put(`${FEEDBACK_API_URL}/feedback/${id}`, feedbackData);
//     return response.data;
//   },

//   deleteFeedback: async (id) => {
//     const response = await axios.delete(`${FEEDBACK_API_URL}/feedback/${id}`);
//     return response.data;
//   },

//   // Status updates
//   updateFeedbackStatus: async (id, statusData) => {
//     const response = await axios.put(
//       `${FEEDBACK_API_URL}/feedback/${id}/status`,
//       statusData
//     );
//     return response.data;
//   },

//   // Progress updates
//   updateFeedbackProgress: async (id, progressData) => {
//     const response = await axios.put(
//       `${FEEDBACK_API_URL}/feedback/${id}/progress`,
//       progressData
//     );
//     return response.data;
//   },

//   // Marketplace updates
//   updateMarketplaceStatus: async (id, marketplaceData) => {
//     const response = await axios.put(
//       `${FEEDBACK_API_URL}/feedback/${id}/marketplace`,
//       marketplaceData
//     );
//     return response.data;
//   },

//   // Notification management
//   getAllNotifications: async () => {
//     const response = await axios.get(`${FEEDBACK_API_URL}/feedback/notifications`);
//     return response.data;
//   },

//   getNotificationById: async (id) => {
//     const response = await axios.get(`${FEEDBACK_API_URL}/feedback/notifications/${id}`);
//     return response.data;
//   },

//   markNotificationAsRead: async (id) => {
//     const response = await axios.put(`${FEEDBACK_API_URL}/feedback/notifications/${id}/read`);
//     return response.data;
//   },

//   // Consumer service status
//   getConsumerStatus: async () => {
//     const response = await axios.get(`${FEEDBACK_API_URL}/consumer/status`);
//     return response.data;
//   },
// };

// export default feedbackService;
