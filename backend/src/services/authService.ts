import { supabase } from '../config/supabase';
import prisma from '../config/database';
import { signToken } from '../utils/jwt';
import { UnauthorizedError, NotFoundError } from '../utils/errors';
import { LoginInput } from '../validators/auth';
import env from '../config/environment';

export const authService = {
  login: async (credentials: LoginInput) => {
    const { email, password } = credentials;

    // Check if using placeholder Supabase config (local dev sandbox mode)
    const isLocalSandbox = env.SUPABASE_URL.includes('your-supabase-project') || !env.SUPABASE_URL;

    if (isLocalSandbox) {
      let role: 'admin' | 'owner' | 'customer';
      let userId: string;

      if (email === 'sainandangupta@gmail.com' && password === 'admin@1575') {
        role = 'admin';
        userId = '00000000-0000-0000-0000-000000000001';
      } else if (email === 'owner@buckscafe.com' && password === 'owner@1575') {
        role = 'owner';
        userId = '00000000-0000-0000-0000-000000000002';
      } else {
        throw new UnauthorizedError('Invalid local dev credentials. Use sainandangupta@gmail.com / admin@1575 or owner@buckscafe.com / owner@1575');
      }

      // Check if default cafe exists in local database, if not create/seed it
      let cafe = await prisma.cafe.findFirst();
      if (!cafe) {
        cafe = await prisma.cafe.create({
          data: {
            id: '00000000-0000-0000-0000-000000000000',
            name: 'Bucks Cafe',
            email: 'info@buckscafe.com',
            phone: '123-456-7890',
            address: '123 Coffee Lane, Seattle, WA',
          }
        });

        // Seed default categories
        const catBeverages = await prisma.category.create({
          data: {
            id: '00000000-0000-0000-0000-000000000011',
            cafe_id: cafe.id,
            name: 'Beverages',
            description: 'Hot and cold gourmet brews',
            display_order: 1,
          }
        });

        const catDesserts = await prisma.category.create({
          data: {
            id: '00000000-0000-0000-0000-000000000012',
            cafe_id: cafe.id,
            name: 'Desserts',
            description: 'Freshly baked pastries and cakes',
            display_order: 2,
          }
        });

        // Seed default dishes
        await prisma.dish.createMany({
          data: [
            {
              id: '00000000-0000-0000-0000-000000000101',
              cafe_id: cafe.id,
              category_id: catBeverages.id,
              name: 'Caramel Macchiato',
              description: 'Freshly steamed milk with vanilla-flavored syrup, marked with espresso and caramel drizzle.',
              price: 240.00,
              is_available: true,
              is_veg: true,
              is_bestseller: true,
            },
            {
              id: '00000000-0000-0000-0000-000000000102',
              cafe_id: cafe.id,
              category_id: catBeverages.id,
              name: 'Iced Matcha Latte',
              description: 'Pure Japanese matcha green tea whisked with milk and served over ice.',
              price: 260.00,
              is_available: true,
              is_veg: true,
            },
            {
              id: '00000000-0000-0000-0000-000000000103',
              cafe_id: cafe.id,
              category_id: catDesserts.id,
              name: 'New York Cheesecake',
              description: 'Classic creamy cheesecake on a buttery graham cracker crust.',
              price: 180.00,
              is_available: true,
              is_veg: true,
              is_bestseller: true,
            }
          ]
        });

        // Also seed a default table for QR ordering
        await prisma.table.create({
          data: {
            id: '00000000-0000-0000-0000-000000000501',
            cafe_id: cafe.id,
            table_number: 5,
            qr_code_token: 'table5token',
            qr_code_url: 'http://localhost:5173/menu?tableToken=table5token'
          }
        });
      }

      // Check if user exists in local database, if not create them
      let dbUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            id: userId,
            email,
            role,
            cafe_id: cafe.id,
          }
        });
      } else if (!dbUser.cafe_id) {
        dbUser = await prisma.user.update({
          where: { id: userId },
          data: { cafe_id: cafe.id }
        });
      }

      const token = signToken({
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        cafeId: dbUser.cafe_id,
      });

      return {
        token,
        role: dbUser.role,
        user: {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          cafe_id: dbUser.cafe_id,
        },
        cafe_id: dbUser.cafe_id,
      };
    }

    // 1. Authenticate credentials against Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new UnauthorizedError(authError?.message || 'Invalid email or password');
    }

    const userId = authData.user.id;

    // 2. Fetch the user's role and cafe_id from the DB users table
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      throw new NotFoundError('User record not found in the cafe database');
    }

    // 3. Generate our application JWT containing the roles & cafe assignment
    const token = signToken({
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      cafeId: dbUser.cafe_id,
    });

    return {
      token,
      role: dbUser.role,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        cafe_id: dbUser.cafe_id,
      },
      cafe_id: dbUser.cafe_id,
    };
  },
};

export default authService;

