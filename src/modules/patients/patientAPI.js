import axiosClient from '../../services/axiosClient';

export const fetchPatientsAPI = async () => {
    const response = await axiosClient.get('/api/patients');
    return response.data;
};

export const fetchPatientByIdAPI = async (id) => {
    const response = await axiosClient.get(`/api/patients/${id}`);
    return response.data;
};

export const createPatientAPI = async (data) => {
    const response = await axiosClient.post('/api/patients', data);
    return response.data;
};

export const updatePatientAPI = async ({ id, data }) => {
    const response = await axiosClient.put(`/api/patients/${id}`, data);
    return response.data;
};

export const deletePatientAPI = async (id) => {
    const response = await axiosClient.delete(`/api/patients/${id}`);
    return response.data;
};
