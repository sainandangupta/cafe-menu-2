import api from './api';
import { Cafe, Settings } from '../types';

export const settingsService = {
  getCafeDetails: async (cafeId: string): Promise<Cafe> => {
    const response = await api.get<Cafe>(`/cafes/${cafeId}`);
    return response.data;
  },

  updateCafeDetails: async (cafeId: string, data: Partial<Cafe>): Promise<Cafe> => {
    const response = await api.patch<Cafe>(`/cafes/${cafeId}`, data);
    return response.data;
  },

  getSettings: async (cafeId: string): Promise<Record<string, string>> => {
    const response = await api.get<Settings[]>(`/settings`, {
      params: { cafe_id: cafeId },
    });
    
    // Map list of settings to key-value object
    const settingsMap: Record<string, string> = {};
    response.data.forEach((item) => {
      settingsMap[item.setting_key] = item.setting_value;
    });
    return settingsMap;
  },

  updateSettings: async (cafeId: string, settings: Record<string, string>): Promise<void> => {
    await api.patch(`/settings`, {
      cafe_id: cafeId,
      settings,
    });
  },
};
export default settingsService;
