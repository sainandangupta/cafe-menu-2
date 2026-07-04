import api from './api';
import { Table } from '../types';

export interface ValidateTableResponse {
  table_id: string;
  cafe_id: string;
  table_number: number;
  cafe_name: string;
}

export const tablesService = {
  validateToken: async (token: string): Promise<ValidateTableResponse> => {
    const response = await api.get<ValidateTableResponse>('/tables/validate', {
      params: { token },
    });
    return response.data;
  },

  getTables: async (cafeId: string): Promise<Table[]> => {
    const response = await api.get<Table[]>('/tables', {
      params: { cafe_id: cafeId },
    });
    return response.data;
  },

  createTable: async (tableNumber: number): Promise<Table> => {
    const response = await api.post<Table>('/tables', { table_number: tableNumber });
    return response.data;
  },

  deleteTable: async (id: string): Promise<void> => {
    await api.delete(`/tables/${id}`);
  },

  generateQrs: async (): Promise<void> => {
    await api.post('/tables/generate-qrs');
  },
};
