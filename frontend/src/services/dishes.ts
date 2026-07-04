import api from './api';
import { Category, Dish } from '../types';
import { CategoryInput, DishInput } from '../utils/validators';

export const dishesService = {
  // Categories API
  getCategories: async (cafeId: string): Promise<Category[]> => {
    const response = await api.get<Category[]>(`/categories`, {
      params: { cafe_id: cafeId },
    });
    return response.data;
  },

  createCategory: async (data: CategoryInput): Promise<Category> => {
    const response = await api.post<Category>(`/categories`, data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<CategoryInput>): Promise<Category> => {
    const response = await api.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  reorderCategories: async (reorderList: { id: string; display_order: number }[]): Promise<void> => {
    await api.post(`/categories/reorder`, { reorderList });
  },

  // Dishes API
  getDishes: async (cafeId: string, isAvailable?: boolean): Promise<Dish[]> => {
    const params: Record<string, any> = { cafe_id: cafeId };
    if (isAvailable !== undefined) {
      params.is_available = isAvailable;
    }
    const response = await api.get<Dish[]>(`/dishes`, { params });
    return response.data;
  },

  getDishById: async (id: string): Promise<Dish> => {
    const response = await api.get<Dish>(`/dishes/${id}`);
    return response.data;
  },

  createDish: async (data: DishInput): Promise<Dish> => {
    const response = await api.post<Dish>(`/dishes`, data);
    return response.data;
  },

  updateDish: async (id: string, data: Partial<Dish>): Promise<Dish> => {
    const response = await api.patch<Dish>(`/dishes/${id}`, data);
    return response.data;
  },

  deleteDish: async (id: string): Promise<void> => {
    await api.delete(`/dishes/${id}`);
  },
};
