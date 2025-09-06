import { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface WishlistState {
  items: WishlistItem[];
  itemCount: number;
}

type WishlistAction =
  | { type: 'ADD_ITEM'; payload: WishlistItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'HYDRATE'; payload: WishlistItem[] };

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'HYDRATE':
      return {
        items: action.payload,
        itemCount: action.payload.length,
      };
    
    case 'ADD_ITEM':
      if (state.items.find(item => item.id === action.payload.id)) {
        return state; // Item already in wishlist
      }
      const newItems = [...state.items, action.payload];
      return {
        items: newItems,
        itemCount: newItems.length,
      };
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        items: filteredItems,
        itemCount: filteredItems.length,
      };
    
    case 'CLEAR_WISHLIST':
      return {
        items: [],
        itemCount: 0,
      };
    
    default:
      return state;
  }
};

const WishlistContext = createContext<{
  state: WishlistState;
  dispatch: React.Dispatch<WishlistAction>;
}>({
  state: { items: [], itemCount: 0 },
  dispatch: () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    itemCount: 0,
  });

  // Persist to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        try {
          const items = JSON.parse(saved);
          dispatch({ type: 'HYDRATE', payload: items });
        } catch (error) {
          console.error('Failed to parse wishlist data:', error);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    }
  }, [state.items]);

  return (
    <WishlistContext.Provider value={{ state, dispatch }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }

  const { state, dispatch } = context;

  const addItem = (item: WishlistItem) => {
    if (state.items.find(wishlistItem => wishlistItem.id === item.id)) {
      toast.info('Item already in wishlist');
      return;
    }
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast.success(`${item.name} added to wishlist!`);
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    toast.success('Item removed from wishlist');
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    toast.success('Wishlist cleared');
  };

  const isInWishlist = (id: string) => {
    return state.items.some(item => item.id === id);
  };

  return {
    ...state,
    addItem,
    removeItem,
    clearWishlist,
    isInWishlist,
  };
}