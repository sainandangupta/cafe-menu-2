import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dishesService } from '../services/dishes';
import { CategoryInput, DishInput } from '../utils/validators';
import { Dish } from '../types';

export const useCategories = (cafeId: string | null) => {
  return useQuery({
    queryKey: ['categories', cafeId],
    queryFn: () => dishesService.getCategories(cafeId || ''),
    enabled: !!cafeId,
  });
};

export const useDishes = (cafeId: string | null, isAvailable?: boolean) => {
  return useQuery({
    queryKey: ['dishes', cafeId, { isAvailable }],
    queryFn: () => dishesService.getDishes(cafeId || '', isAvailable),
    enabled: !!cafeId,
  });
};

export const useDishDetails = (dishId: string | undefined) => {
  return useQuery({
    queryKey: ['dish', dishId],
    queryFn: () => dishesService.getDishById(dishId || ''),
    enabled: !!dishId,
  });
};

export const useCreateDish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishesService.createDish,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
    },
  });
};

export const useUpdateDish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Dish> }) =>
      dishesService.updateDish(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
      queryClient.invalidateQueries({ queryKey: ['dish'] });
    },
  });
};

export const useDeleteDish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishesService.deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishesService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryInput> }) =>
      dishesService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishesService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dishesService.reorderCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
