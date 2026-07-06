import prisma from '../config/database';
import logger from '../utils/logger';

import { getIngredients } from '../utils/ingredientGenerator';

async function main() {
  logger.info('Starting AI Ingredient Generator...');

  try {
    const dishes = await prisma.dish.findMany({
      include: {
        category: true,
      },
    });

    logger.info(`Fetched ${dishes.length} dishes from the database.`);

    let updatedCount = 0;

    for (const dish of dishes) {
      const generated = getIngredients(dish.name, dish.category.name);
      
      // Update in database
      await prisma.dish.update({
        where: { id: dish.id },
        data: {
          ingredients: generated,
        },
      });

      updatedCount++;
      if (updatedCount % 20 === 0 || updatedCount === dishes.length) {
        logger.info(`Updated ingredients for ${updatedCount}/${dishes.length} dishes...`);
      }
    }

    logger.info('Successfully generated and updated ingredients for all dishes!');
  } catch (error) {
    logger.error('Failed to update ingredients:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
