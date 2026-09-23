import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { API_URL } from '@/config/api';
import { setWishlistItems } from '@/store/shop/wishlist-slice';
import { toast } from '@/components/ui/use-toast';

export interface WishlistItem {
  id: string;
  name: string;
  title?: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  image: string;
  category?: string;
  brand?: string;
  totalStock?: number;
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
        return state;
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

interface WishlistContextType {
  items: WishlistItem[];
  itemCount: number;
  isLoading: boolean;
  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (id: string, name?: string) => Promise<void>;
  toggleWishlist: (item: WishlistItem) => Promise<boolean>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  itemCount: 0,
  isLoading: false,
  addItem: async () => {},
  removeItem: async () => {},
  toggleWishlist: async () => false,
  clearWishlist: async () => {},
  isInWishlist: () => false,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, {
    items: [],
    itemCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user, isAuthenticated } = useSelector((state: any) => state.auth || {});
  const dispatchRedux = useDispatch();
  const userId = user?.id || user?._id;

  // Load user's wishlist from MongoDB database whenever user is authenticated
  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined') {
      if (isAuthenticated && userId) {
        const userKey = userId;
        const storageKey = `wishlist_${userKey}`;
        
        // Check for guest wishlist saved while unauthenticated
        let guestWishlistItems: any[] = [];
        try {
          const guestRaw = localStorage.getItem("daylight_guest_wishlist");
          if (guestRaw) {
            const parsed = JSON.parse(guestRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              guestWishlistItems = parsed;
            }
          }
        } catch (e) {}

        // Immediate local hydration for instant UI rendering while database loads
        const localSaved = localStorage.getItem(storageKey);
        const initialCandidate = localSaved ? (() => {
          try {
            const parsed = JSON.parse(localSaved);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })() : [];

        const combinedHydration = [...guestWishlistItems];
        initialCandidate.forEach((it: any) => {
          if (!combinedHydration.some((c: any) => String(c.id) === String(it.id))) {
            combinedHydration.push(it);
          }
        });

        if (combinedHydration.length > 0) {
          dispatch({ type: 'HYDRATE', payload: combinedHydration });
          dispatchRedux(setWishlistItems(combinedHydration));
        }

        // Fetch authoritative wishlist from MongoDB
        const fetchWishlistFromDatabase = async () => {
          setIsLoading(true);
          try {
            const res = await axios.get(`${API_URL}/api/shop/wishlist/get/${userId}`);
            if (res.data?.success && isMounted) {
              const dbItems = (res.data.data?.items || []).map((it: any) => ({
                id: String(it.id || it.productId || it._id),
                name: it.name || it.title || "Maison Creation",
                title: it.title || it.name || "Maison Creation",
                price: Number(it.price) || 0,
                salePrice: it.salePrice ? Number(it.salePrice) : undefined,
                image: typeof it.image === "string" ? it.image : it.image?.url || "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
                category: it.category || "",
                brand: it.brand || "",
                totalStock: it.totalStock ?? 10,
              }));

              // If there are guest wishlist items or local items from this device, sync them to MongoDB
              const allLocalCandidates = [...guestWishlistItems, ...initialCandidate];
              const unsynced = allLocalCandidates.filter(
                (l: any) => !dbItems.some((d: any) => String(d.id) === String(l.id))
              );

              if (unsynced.length > 0) {
                try {
                  const syncRes = await axios.post(`${API_URL}/api/shop/wishlist/sync`, {
                    userId,
                    items: unsynced,
                  });
                  if (syncRes.data?.success && isMounted) {
                    const merged = (syncRes.data.data?.items || []).map((it: any) => ({
                      id: String(it.id || it.productId?._id || it.productId || it._id),
                      name: it.name || it.title || "Maison Creation",
                      title: it.title || it.name || "Maison Creation",
                      price: Number(it.price) || 0,
                      salePrice: it.salePrice ? Number(it.salePrice) : undefined,
                      image: typeof it.image === "string" ? it.image : it.image?.url,
                      category: it.category || "",
                      brand: it.brand || "",
                      totalStock: it.totalStock ?? 10,
                    }));
                    dispatch({ type: 'HYDRATE', payload: merged });
                    dispatchRedux(setWishlistItems(merged));
                    localStorage.setItem(storageKey, JSON.stringify(merged));
                    localStorage.removeItem("daylight_guest_wishlist");
                    setIsLoading(false);
                    return;
                  }
                } catch (syncErr) {
                  console.error("Failed to sync guest wishlist with server:", syncErr);
                }
              }

              localStorage.removeItem("daylight_guest_wishlist");
              dispatch({ type: 'HYDRATE', payload: dbItems });
              dispatchRedux(setWishlistItems(dbItems));
              localStorage.setItem(storageKey, JSON.stringify(dbItems));
            }
          } catch (error) {
            console.error('Failed to load wishlist from MongoDB:', error);
          } finally {
            if (isMounted) setIsLoading(false);
          }
        };

        fetchWishlistFromDatabase();
      } else {
        // Not logged in: load guest wishlist from local storage
        try {
          const guestRaw = localStorage.getItem("daylight_guest_wishlist");
          const guestItems = guestRaw ? JSON.parse(guestRaw) : [];
          if (Array.isArray(guestItems)) {
            dispatch({ type: 'HYDRATE', payload: guestItems });
            dispatchRedux(setWishlistItems(guestItems));
          }
        } catch (_) {}
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, userId, dispatchRedux]);

  const addItem = async (item: WishlistItem) => {
    if (state.items.find(wishlistItem => String(wishlistItem.id) === String(item.id))) {
      toast({ title: 'Already in your Wishlist', description: `${item.name} is already saved.` });
      return;
    }

    if (!isAuthenticated || !userId) {
      const updated = [...state.items, item];
      dispatch({ type: 'ADD_ITEM', payload: item });
      dispatchRedux(setWishlistItems(updated));
      try {
        localStorage.setItem("daylight_guest_wishlist", JSON.stringify(updated));
      } catch (_) {}
      toast({
        title: 'Saved to Wishlist',
        description: `${item.name} saved. Sign in at checkout to keep it forever.`,
      });
      return;
    }

    // Optimistic UI state update
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast({
      title: 'Saved to Wishlist',
      description: `${item.name} has been added to your saved pieces across all devices.`,
    });

    // Save permanently to MongoDB
    try {
      const res = await axios.post(`${API_URL}/api/shop/wishlist/add`, {
        userId,
        productId: item.id,
        name: item.name,
        price: item.price,
        salePrice: item.salePrice,
        image: item.image,
        category: item.category,
        brand: item.brand,
        totalStock: item.totalStock,
      });

      if (res.data?.success) {
        const dbItems = (res.data.data?.items || []).map((it: any) => ({
          id: String(it.id || it.productId || it._id),
          name: it.name || it.title || "Maison Creation",
          title: it.title || it.name || "Maison Creation",
          price: Number(it.price) || 0,
          salePrice: it.salePrice ? Number(it.salePrice) : undefined,
          image: typeof it.image === "string" ? it.image : it.image?.url,
          category: it.category || "",
          brand: it.brand || "",
          totalStock: it.totalStock ?? 10,
        }));
        dispatch({ type: 'HYDRATE', payload: dbItems });
        dispatchRedux(setWishlistItems(dbItems));
        localStorage.setItem(`wishlist_${userId}`, JSON.stringify(dbItems));
      }
    } catch (err) {
      console.error("Failed to persist wishlist item to MongoDB:", err);
    }
  };

  const removeItem = async (id: string, name?: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
    toast({
      title: 'Removed from Wishlist',
      description: name ? `${name} has been removed.` : 'Item removed from your wishlist.',
    });

    if (!isAuthenticated || !userId) {
      const updated = state.items.filter(it => String(it.id) !== String(id));
      dispatchRedux(setWishlistItems(updated));
      try {
        localStorage.setItem("daylight_guest_wishlist", JSON.stringify(updated));
      } catch (_) {}
      return;
    }

    if (userId) {
      try {
        const res = await axios.delete(`${API_URL}/api/shop/wishlist/${userId}/${id}`);
        if (res.data?.success) {
          const dbItems = (res.data.data?.items || []).map((it: any) => ({
            id: String(it.id || it.productId || it._id),
            name: it.name || it.title || "Maison Creation",
            title: it.title || it.name || "Maison Creation",
            price: Number(it.price) || 0,
            salePrice: it.salePrice ? Number(it.salePrice) : undefined,
            image: typeof it.image === "string" ? it.image : it.image?.url,
            category: it.category || "",
            brand: it.brand || "",
            totalStock: it.totalStock ?? 10,
          }));
          dispatch({ type: 'HYDRATE', payload: dbItems });
          dispatchRedux(setWishlistItems(dbItems));
          localStorage.setItem(`wishlist_${userId}`, JSON.stringify(dbItems));
        }
      } catch (err) {
        console.error("Failed to delete wishlist item from MongoDB:", err);
      }
    }
  };

  const toggleWishlist = async (item: WishlistItem): Promise<boolean> => {
    const exists = state.items.some(w => String(w.id) === String(item.id));
    if (exists) {
      await removeItem(item.id, item.name);
      return false;
    } else {
      await addItem(item);
      return true;
    }
  };

  const clearWishlist = async () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    dispatchRedux(setWishlistItems([]));
    if (!isAuthenticated || !userId) {
      try {
        localStorage.removeItem("daylight_guest_wishlist");
      } catch (_) {}
      toast({ title: 'Wishlist Cleared', description: 'All saved items have been removed.' });
      return;
    }

    if (userId) {
      localStorage.removeItem(`wishlist_${userId}`);
    }
    toast({ title: 'Wishlist Cleared', description: 'All saved items have been removed from your account.' });

    if (userId) {
      try {
        await axios.delete(`${API_URL}/api/shop/wishlist/clear/${userId}`);
      } catch (err) {
        console.error("Failed to clear MongoDB wishlist:", err);
      }
    }
  };

  const isInWishlist = (id: string) => {
    return state.items.some(item => String(item.id) === String(id));
  };

  return (
    <WishlistContext.Provider
      value={{
        items: state.items,
        itemCount: state.itemCount,
        isLoading,
        addItem,
        removeItem,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

