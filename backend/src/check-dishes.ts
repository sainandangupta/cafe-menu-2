import prisma from './config/database';

async function main() {
  console.log('Querying database...');
  try {
    const dishCount = await prisma.dish.count();
    console.log('DISH_COUNT:', dishCount);
    
    const cafeCount = await prisma.cafe.count();
    console.log('CAFE_COUNT:', cafeCount);
    
    const categoryCount = await prisma.category.count();
    console.log('CATEGORY_COUNT:', categoryCount);

    if (dishCount > 0) {
      const dishes = await prisma.dish.findMany({
        include: {
          category: true,
          cafe: true
        }
      });
      console.log('DISHES_LIST:', JSON.stringify(dishes, null, 2));
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
