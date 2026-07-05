import api from './api';
import { Rating } from '../types';

export interface CreateRatingInput {
  cafe_id: string;
  dish_id: string;
  order_id: string;
  table_id: string;
  rating: number;
  comment?: string;
}
export interface DishRatingDetails {
  avg_rating: number;
  rating_count: number;
  ratings: { rating: number; comment?: string; created_at?: string }[];
}

export const ratingsService = {
  getRatingsByDish: async (dishId: string): Promise<Rating[]> => {
    const response = await api.get<Rating[]>(`/ratings`, {
      params: { dish_id: dishId },
    });
    return response.data;
  },

  getDishRatingDetails: async (dishId: string): Promise<DishRatingDetails> => {
    const response = await api.get<DishRatingDetails>(`/dishes/${dishId}/ratings`);
    return response.data;
  },

  getRatingsByCafe: async (cafeId: string): Promise<Rating[]> => {
    const response = await api.get<Rating[]>(`/ratings`, {
      params: { cafe_id: cafeId },
    });
    return response.data;
  },

  createRating: async (data: CreateRatingInput): Promise<Rating> => {
    const response = await api.post<Rating>(`/ratings`, data);
    return response.data;
  },
};
export default ratingsService;
