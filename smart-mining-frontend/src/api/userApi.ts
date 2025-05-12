import axios from 'axios';
import { User, Role } from '../types';

const API_BASE_URL = 'https://your-backend-api.com';

export const createUser = async (userData: User) => {
  const response = await axios.post(`${API_BASE_URL}/users`, userData);
  return response.data;
};

export const updateUser = async (userId: string, userData: User) => {
  const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
  return response.data;
};

export const createRole = async (roleData: Role) => {
  const response = await axios.post(`${API_BASE_URL}/roles`, roleData);
  return response.data;
}; 