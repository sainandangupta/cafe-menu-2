import prisma from '../config/database';
import { CreateDishInput, UpdateDishInput } from '../validators/dishes';
import { NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';
import { getIngredients } from '../utils/ingredientGenerator';

export const dishService = {
  getDishes: async (filters: {
    cafe_id: string;
    category_id?: string;
    is_available?: boolean;
    customer_only?: boolean;
  }) => {
    const whereClause: Prisma.DishWhereInput = {
      cafe_id: filters.cafe_id,
    };

    if (filters.category_id) {
      whereClause.category_id = filters.category_id;
    }

    if (filters.is_available !== undefined) {
      whereClause.is_available = filters.is_available;
    } else if (filters.customer_only) {
      // Customers can only see active/available dishes
      whereClause.is_available = true;
    }

    // Fetch dishes
    const dishes = await prisma.dish.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    // Fetch aggregate rating scores for all dishes in this cafe
    const ratings = await prisma.rating.groupBy({
      by: ['dish_id'],
      _avg: { rating: true },
      _count: { id: true },
      where: { cafe_id: filters.cafe_id },
    });

    // Map rating scores to dishes
    const ratingsMap = new Map<string, { rating_avg: number; rating_count: number }>();
    ratings.forEach((r) => {
      ratingsMap.set(r.dish_id, {
        rating_avg: r._avg.rating ? parseFloat(r._avg.rating.toFixed(1)) : 0,
        rating_count: r._count.id,
      });
    });

    return dishes.map((dish) => {
      const score = ratingsMap.get(dish.id) || { rating_avg: 0, rating_count: 0 };
      return {
        ...dish,
        price: Number(dish.price),
        rating_avg: score.rating_avg,
        rating_count: score.rating_count,
      };
    });
  },

  getDishById: async (id: string) => {
    const dish = await prisma.dish.findUnique({
      where: { id },
    });

    if (!dish) {
      throw new NotFoundError('Dish not found');
    }

    // Get rating aggregates
    const ratingAggregate = await prisma.rating.aggregate({
      where: { dish_id: id },
      _avg: { rating: true },
      _count: { _all: true },
    });

    return {
      ...dish,
      price: Number(dish.price),
      rating_avg: ratingAggregate._avg.rating ? parseFloat(ratingAggregate._avg.rating.toFixed(1)) : 0,
      rating_count: ratingAggregate._count._all,
    };
  },

  createDish: async (cafeId: string, data: CreateDishInput) => {
    let finalIngredients = data.ingredients || [];
    if (finalIngredients.length === 0) {
      const category = await prisma.category.findUnique({
        where: { id: data.category_id },
      });
      finalIngredients = getIngredients(data.name, category?.name || '');
    }

    const newDish = await prisma.dish.create({
      data: {
        cafe_id: cafeId,
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: new Prisma.Decimal(data.price),
        ingredients: finalIngredients,
        image_url: data.image_url,
        is_available: data.is_available,
        is_veg: data.is_veg,
        is_spicy: data.is_spicy,
        is_bestseller: data.is_bestseller,
        is_seasonal: data.is_seasonal,
        labels: data.labels,
      },
    });

    return {
      ...newDish,
      price: Number(newDish.price),
    };
  },

  updateDish: async (id: string, cafeId: string, data: UpdateDishInput) => {
    // Verify existence
    const existing = await prisma.dish.findFirst({
      where: { id, cafe_id: cafeId },
    });

    if (!existing) {
      throw new NotFoundError('Dish not found in this cafe');
    }

    // Format fields
    const updateData: Prisma.DishUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.ingredients !== undefined) updateData.ingredients = data.ingredients;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.is_available !== undefined) updateData.is_available = data.is_available;
    if (data.is_veg !== undefined) updateData.is_veg = data.is_veg;
    if (data.is_spicy !== undefined) updateData.is_spicy = data.is_spicy;
    if (data.is_bestseller !== undefined) updateData.is_bestseller = data.is_bestseller;
    if (data.is_seasonal !== undefined) updateData.is_seasonal = data.is_seasonal;
    if (data.labels !== undefined) updateData.labels = data.labels;
    if (data.category_id !== undefined) updateData.category = { connect: { id: data.category_id } };

    const updatedDish = await prisma.dish.update({
      where: { id },
      data: updateData,
    });

    return {
      ...updatedDish,
      price: Number(updatedDish.price),
    };
  },

  deleteDish: async (id: string, cafeId: string) => {
    const existing = await prisma.dish.findFirst({
      where: { id, cafe_id: cafeId },
    });

    if (!existing) {
      throw new NotFoundError('Dish not found in this cafe');
    }

    await prisma.dish.delete({
      where: { id },
    });
  },
};

export default dishService;
