// ============================================

// ============================================

const API_BASE_URL = 'http://localhost:5000/api';
const BACKEND_URL = 'http://localhost:5000';

// Get auth token from session storage 
const getAuthToken = () => {
    try {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        return user.token || '';
    } catch (error) {
        console.error('Error parsing user from sessionStorage:', error);
        return '';
    }
};

// Helper to get full image URL
export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already a full URL
    if (path.startsWith('data:')) return path; // Base64 image

    // If it's a relative path (like /product1.png), assume it's from the backend or public folder
    // For Engager, assuming backend serves it
    return `${BACKEND_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Create headers with auth token
const getHeaders = () => {
    const authHeader = {};
    const token = getAuthToken();
    if (token) {
        authHeader['Authorization'] = `Bearer ${token}`;
    }

    return authHeader;
};

// Global notification callback to be set by the UI
let notifyCallback = null;
export const setNotifyCallback = (callback) => {
    notifyCallback = callback;
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
    try {
        const token = getAuthToken(); // Use the existing getAuthToken function
        const headers = {
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Set Content-Type: application/json by default unless it's FormData
        if (!(options.body instanceof FormData)) {
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
        } else {
            // For FormData, we must let fetch set the Content-Type with boundary
            delete headers['Content-Type'];
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: headers
        });

        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
                try {
                    const textRaw = await response.text();
                    errorMessage = textRaw || errorMessage;
                } catch (e) { }
            }

            // Automatically notify if callback is set
            if (notifyCallback) {
                notifyCallback(errorMessage, 'error');
            }

            throw new Error(errorMessage);
        }

        // Parse JSON response - read text first to avoid stream errors
        const textRaw = await response.text();

        // Handle empty responses (204 No Content)
        if (!textRaw && response.status === 204) {
            return null;
        }

        // Parse the text as JSON
        try {
            return JSON.parse(textRaw);
        } catch (e) {
            console.error('Failed to parse JSON response:', e, textRaw);
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        // Handle network errors
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.error(`API Error (${endpoint}): Network error - Backend server may be down or unreachable`);
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        }

        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

// ============================================
// AUTHENTICATION APIS
// ============================================

export const authAPI = {
    // Login
    login: async (email, password) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    // Get current user
    getCurrentUser: async () => {
        return apiCall('/auth/me');
    },
};

// ============================================
// PROJECT APIS
// ============================================

export const projectAPI = {
    // Get all projects with optional filters
    getAll: async (filters = {}) => {
        const queryParams = new URLSearchParams();

        if (filters.status) queryParams.append('status', filters.status);
        if (filters.type) queryParams.append('type', filters.type);
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.sort) queryParams.append('sort', filters.sort);
        if (filters.order) queryParams.append('order', filters.order);

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/projects?${queryString}` : '/projects';

        return apiCall(endpoint);
    },

    // Get single project by ID
    getById: async (id) => {
        return apiCall(`/projects/${id}`);
    },

    // Create new project
    create: async (projectData) => {
        return apiCall('/projects', {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
    },

    // Update project
    update: async (id, projectData) => {
        return apiCall(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(projectData),
        });
    },

    // Delete project
    delete: async (id) => {
        return apiCall(`/projects/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// PRODUCT APIS
// ============================================

export const productAPI = {
    // Get all products
    getAll: async () => {
        return apiCall('/products');
    },

    // Get single product by ID
    getById: async (id) => {
        return apiCall(`/products/${id}`);
    },

    // Create new product
    create: async (productData) => {
        return apiCall('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    },

    // Update product
    update: async (id, productData) => {
        return apiCall(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    },

    // Delete product
    delete: async (id) => {
        return apiCall(`/products/${id}`, {
            method: 'DELETE',
        });
    },

    // Upload image
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return apiCall('/upload', {
            method: 'POST',
            body: formData,
            // Fetch will set correct Content-Type for FormData automatically
            headers: {
                'Content-Type': undefined,
            }
        });
    },
};

// ============================================
// DASHBOARD APIS
// ============================================

export const dashboardAPI = {
    // Get dashboard statistics
    getStats: async () => {
        return apiCall('/dashboard/stats');
    },
};

// ============================================
// ORDER APIS
// ============================================

export const orderAPI = {
    // Get all orders
    getAll: async () => {
        return apiCall('/orders');
    },
    // Get single order by ID
    getById: async (id) => {
        return apiCall(`/orders/${id}`);
    },

    // Verify payment manually
    verifyPayment: async (id) => {
        return apiCall(`/orders/${id}/verify-payment`);
    }
};

// ============================================
// STAFF APIS
// ============================================

export const staffAPI = {
    // Get all staff (super-admin only)
    getAll: async () => {
        return apiCall('/staff');
    },

    // Get single staff member
    getById: async (id) => {
        return apiCall(`/staff/${id}`);
    },

    // Create new staff member (super-admin only)
    create: async (staffData) => {
        return apiCall('/staff', {
            method: 'POST',
            body: JSON.stringify(staffData),
        });
    },

    // Update staff member
    update: async (id, staffData) => {
        return apiCall(`/staff/${id}`, {
            method: 'PUT',
            body: JSON.stringify(staffData),
        });
    },

    // Delete staff member (super-admin only)
    delete: async (id) => {
        return apiCall(`/staff/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Format currency to Nigerian Naira
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

// Format date
export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Get status class for styling
export const getStatusClass = (status) => {
    const statusMap = {
        'Completed': 'status-completed',
        'In Progress': 'status-progress',
        'Planning': 'status-planning',
        'On Hold': 'status-hold',
        'Cancelled': 'status-cancelled',
    };
    return statusMap[status] || '';
};

// Project types
export const projectTypes = ['Residential', 'Commercial', 'Infrastructure', 'Industrial'];

// Project statuses
export const projectStatuses = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

// Staff roles
export const staffRoles = ['super-admin', 'admin', 'viewer'];

// Generic API object
export const api = {
    get: (endpoint, options) => apiCall(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options) => apiCall(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body, options) => apiCall(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint, options) => apiCall(endpoint, { ...options, method: 'DELETE' }),
};

export default {
    api,
    authAPI,
    projectAPI,
    productAPI,
    dashboardAPI,
    orderAPI,
    staffAPI,
    getImageUrl,
    formatCurrency,
    formatDate,
    getStatusClass,
    projectTypes,
    projectStatuses,
    staffRoles,
};
