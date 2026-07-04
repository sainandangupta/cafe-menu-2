import prisma from '../config/database';
import logger from '../utils/logger';

async function main() {
  const newBaseUrl = process.env.BACKEND_URL;
  if (!newBaseUrl) {
    logger.error('Please set the BACKEND_URL environment variable in your .env file first.');
    process.exit(1);
  }

  // Remove any trailing slash from BACKEND_URL for consistency
  const cleanBaseUrl = newBaseUrl.endsWith('/') ? newBaseUrl.slice(0, -1) : newBaseUrl;

  logger.info(`Updating all dish image URLs in database to use base URL: ${cleanBaseUrl}`);

  // Find all dishes where the image URL contains localhost:5000
  const dishes = await prisma.dish.findMany({
    where: {
      image_url: {
        contains: 'localhost:5000',
      },
    },
  });

  logger.info(`Found ${dishes.length} dishes referencing localhost:5000`);

  let updatedCount = 0;
  for (const dish of dishes) {
    if (dish.image_url) {
      const updatedUrl = dish.image_url.replace(/https?:\/\/localhost:5000/, cleanBaseUrl);
      await prisma.dish.update({
        where: { id: dish.id },
        data: { image_url: updatedUrl },
      });
      updatedCount++;
    }
  }

  logger.info(`Successfully updated ${updatedCount} dish image URLs to use the production URL.`);
}

main()
  .catch((err) => {
    logger.error('Failed to update image URLs:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
