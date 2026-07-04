export interface UserSession {
  userId: string;
  email: string;
  role: 'admin' | 'owner' | 'customer';
  cafeId: string | null;
}

export interface CartInputItem {
  dish_id: string;
  quantity: number;
  special_instructions?: string;
}

export interface CreateOrderInput {
  table_id: string;
  items: CartInputItem[];
  customer_notes?: string;
}
