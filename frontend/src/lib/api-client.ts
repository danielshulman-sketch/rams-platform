import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// API helper functions
export const api = {
    // Auth
    register: (data: any) => apiClient.post('/auth/register', data),
    login: (data: any) => apiClient.post('/auth/login', data),

    // Jobs
    createJob: (data: any) => apiClient.post('/jobs', data),
    getJobs: () => apiClient.get('/jobs'),
    getJob: (id: string) => apiClient.get(`/jobs/${id}`),
    updateJob: (id: string, data: any) => apiClient.put(`/jobs/${id}`, data),
    deleteJob: (id: string) => apiClient.delete(`/jobs/${id}`),

    // RAMS
    createRams: (data: any) => apiClient.post('/rams', data),
    getRams: () => apiClient.get('/rams'),
    getRamsById: (id: string) => apiClient.get(`/rams/${id}`),
    updateRams: (id: string, data: any) => apiClient.put(`/rams/${id}`, data),
    deleteRams: (id: string) => apiClient.delete(`/rams/${id}`),
    exportRams: (id: string, format: 'docx' | 'pdf', templateId?: string) => {
        const params = new URLSearchParams({ format });
        if (templateId) {
            params.append('templateId', templateId);
        }
        return apiClient.get(`/rams/${id}/export?${params.toString()}`, { responseType: 'blob' });
    },

    // Organizations
    getOrganization: () => apiClient.get('/organizations/me'),
    updateOrganization: (data: any) => apiClient.put('/organizations/me', data),

    // Users
    getUsers: () => apiClient.get('/users'),
    createUser: (data: any) => apiClient.post('/users', data),
    updateUser: (id: string, data: any) => apiClient.put(`/users/${id}`, data),
    deleteUser: (id: string) => apiClient.delete(`/users/${id}`),

    // Upload
    uploadJobPDF: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        return apiClient.post('/upload/extract-job', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Hospitals
    lookupHospital: (postcode: string) => apiClient.get(`/hospitals/lookup?postcode=${encodeURIComponent(postcode)}`),

    // Knowledge Base
    getKnowledgeBase: (category?: string, search?: string) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        return apiClient.get(`/knowledge-base?${params.toString()}`);
    },
    getKnowledgeItem: (id: string) => apiClient.get(`/knowledge-base/${id}`),
    createKnowledgeItem: (data: any) => apiClient.post('/knowledge-base', data),
    updateKnowledgeItem: (id: string, data: any) => apiClient.put(`/knowledge-base/${id}`, data),
    deleteKnowledgeItem: (id: string) => apiClient.delete(`/knowledge-base/${id}`),
    getKnowledgeCategories: () => apiClient.get('/knowledge-base/categories'),
    uploadKnowledgeFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/knowledge-base/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    uploadKnowledgeFiles: async (files: File[]) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return apiClient.post('/knowledge-base/upload-bulk', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Templates
    getTemplates: () => apiClient.get('/templates'),
    uploadTemplate: (formData: FormData) => apiClient.post('/templates/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    deleteTemplate: (id: string) => apiClient.delete(`/templates/${id}`),
    setDefaultTemplate: (id: string) => apiClient.put(`/templates/${id}/default`),

    // AI Generation
    extractScope: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/upload/extract-scope', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    generateRamsWithAI: (file: File, jobDetails?: any) => {
        const formData = new FormData();
        formData.append('file', file);
        if (jobDetails) {
            formData.append('jobDetails', JSON.stringify(jobDetails));
        }
        return apiClient.post('/upload/generate-rams', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};
