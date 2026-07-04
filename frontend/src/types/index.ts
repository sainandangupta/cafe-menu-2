export type UserRole = 'admin' | 'owner' | 'customer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  cafe_id: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Cafe {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gst_percentage: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  cafe_id: string;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Dish {
  id: string;
  cafe_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  ingredients: string[];
  image_url?: string;
  is_available: boolean;
  is_veg: boolean;
  is_spicy: boolean;
  is_bestseller: boolean;
  is_seasonal: boolean;
  labels: string[];
  category?: Category;
  created_at?: string;
  updated_at?: string;
}

export interface Table {
  id: string;
  cafe_id: string;
  table_number: number;
  qr_code_token: string;
  qr_code_url?: string;
  is_active: boolean;
  created_at?: string;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'prepared' | 'delivered' | 'rejected';

export interface Order {
  id: string;
  cafe_id: string;
  table_id: string;
  status: OrderStatus;
  subtotal: number;
  gst_amount: number;
  total: number;
  customer_notes?: string;
  order_token?: string;
  placed_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at?: string;
  // Extended UI fields
  table?: Table;
  table_number?: number;
  order_items?: OrderItemExtended[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  dish_id: string;
  quantity: number;
  price: number;
  special_instructions?: string;
  created_at?: string;
}

export interface OrderItemExtended extends OrderItem {
  dish?: Dish;
}

export interface Rating {
  id: string;
  cafe_id: string;
  dish_id: string;
  order_id: string;
  table_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface Settings {
  id: string;
  cafe_id: string;
  setting_key: string;
  setting_value: string;
  created_at?: string;
  updated_at?: string;
}

export interface CafeSettingsMap {
  cafeName: string;
  email: string;
  phone: string;
  address: string;
  gstPercentage: number;
  taxType: 'item' | 'total';
  logoUrl?: string;
  openTime: string;
  closeTime: string;
  closedDays: string[];
  emailNotifications: boolean;
  soundAlerts: boolean;
}
