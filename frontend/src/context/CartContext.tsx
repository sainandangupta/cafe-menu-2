import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculateGst } from '../utils/formatters';

export interface CartItem {
  dish_id: string;
  name: string;
  price: number;
  image_url?: string;
  quantity: number;
  special_instructions?: string;
}

interface TableContextType {
  tableId: string | null;
  tableNumber: number | null;
  cafeId: string | null;
  cafeName: string | null;
  tableToken: string | null;
}

interface CartContextType {
  items: CartItem[];
  tableContext: TableContextType;
  addItem: (item: CartItem) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  setTableContext: (info: TableContextType) => void;
  totals: {
    subtotal: number;
    gstAmount: number;
    total: number;
    gstPercentage: number;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GST_DEFAULT = 5.0;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart from localStorage if present
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [tableContext, setTableContextState] = useState<TableContextType>(() => {
    const saved = localStorage.getItem('table_context');
    return saved ? JSON.parse(saved) : { tableId: null, tableNumber: null, cafeId: null, cafeName: null, tableToken: null };
  });

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('table_context', JSON.stringify(tableContext));
  }, [tableContext]);

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.dish_id === newItem.dish_id &&
          item.special_instructions === newItem.special_instructions
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }

      return [...prevItems, newItem];
    });
  };

  const removeItem = (dishId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.dish_id !== dishId));
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.dish_id === dishId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart_items');
  };

  const setTableContext = (info: TableContextType) => {
    setTableContextState(info);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { gstAmount, total } = calculateGst(subtotal, GST_DEFAULT);

  const totals = {
    subtotal,
    gstAmount,
    total,
    gstPercentage: GST_DEFAULT,
  };

  return (
    <CartContext.Provider
      value={{
        items,
        tableContext,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setTableContext,
        totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};
export default CartContext;
