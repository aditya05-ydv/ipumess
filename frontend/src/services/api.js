import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common.Authorization;
    }
};

export const authService = {
    login: async (hostel, roomNumber, pin) => {
        // 🗑️ DUMMY LOGIN - No actual API call
        return { isFirstLogin: false, token: 'dummy_' + Math.random(), user: { id: 'dummy_' + roomNumber } };
    },
    adminLogin: async (hostel, password) => {
        // 🗑️ DUMMY ADMIN LOGIN - No actual API call
        return response.data;
    },
    changePassword: async ({ userId, currentPassword, newPassword }) => {
        const response = await api.post('/auth/change-password', { userId, currentPassword, newPassword });
        return response.data;
    },
    resetPassword: async ({ roomNumber, hostel }) => {
        const response = await api.post('/auth/reset-password', { roomNumber, hostel });
        return response.data;
    },
};

export const menuService = {
    getMenu: async (hostel) => {
        const response = await api.get(`/menu/${hostel}`);
        return response.data;
    },
    updateMenu: async (hostel, day, meals) => {
        const response = await api.put(`/menu/${hostel}/${day}`, { meals });
        return response.data;
    },
    deleteMenuDay: async (hostel, day) => {
        const response = await api.delete(`/menu/${hostel}/${day}`);
        return response.data;
    },
};

export const ratingService = {
    submitRating: async (data) => {
        const response = await api.post('/ratings', data);
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/ratings');
        return response.data;
    },
    getItemStats: async (itemName) => {
        const response = await api.get(`/ratings/item/${encodeURIComponent(itemName)}`);
        return response.data;
    },
    getWeeklyGraphData: async () => {
        const response = await api.get('/ratings/weekly-graph');
        return response.data;
    },
    getWeeklyAverages: async () => {
        const response = await api.get('/ratings/weekly-averages');
        return response.data;
    },
    resetAllRatings: async () => {
        const response = await api.post('/ratings/admin/reset');
        return response.data;
    },
};

export const pollService = {
    getPolls: async () => {
        const response = await api.get('/poll');
        return response.data;
    },
    getCurrentPolls: async () => {
        const response = await api.get('/poll/current');
        return response.data;
    },
    createPoll: async (data) => {
        const response = await api.post('/poll', data);
        return response.data;
    },
    vote: async (pollId, optionIndex) => {
        const response = await api.post('/poll/vote', { pollId, optionIndex });
        return response.data;
    },
    deletePoll: async (pollId) => {
        const response = await api.delete(`/poll/${pollId}`);
        return response.data;
    },
    resetPolls: async () => {
        const response = await api.post('/poll/reset');
        return response.data;
    },
    getPollResults: async (pollId) => {
        const response = await api.get(`/poll/results/${pollId}`);
        return response.data;
    },
    getExpiredPolls: async () => {
        const response = await api.get('/poll/expired');
        return response.data;
    },
};

// ============================================================
// FASTING REGISTER FEATURE - SERVICE
// To remove this feature: delete this block
// ============================================================
export const fastingService = {
    getFasting: async () => {
        const response = await api.get('/fasting');
        return response.data;
    },
    activate: async (festivalName) => {
        const response = await api.post('/fasting/activate', { festivalName });
        return response.data;
    },
    deactivate: async () => {
        const response = await api.post('/fasting/deactivate');
        return response.data;
    },
    submit: async (name, roomNumber) => {
        const response = await api.post('/fasting/submit', { name, roomNumber });
        return response.data;
    },
    edit: async (name, roomNumber) => {
        const response = await api.put('/fasting/edit', { name, roomNumber });
        return response.data;
    },
    deleteEntry: async () => {
        const response = await api.delete('/fasting/entry');
        return response.data;
    },
};
// ============================================================
// END FASTING REGISTER FEATURE - SERVICE
// ============================================================

export default api;
