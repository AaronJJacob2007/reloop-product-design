import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  cleanCart,
  cleanOrders,
  cleanWishlist,
  totals,
  type Cart,
  type Order,
  type ShippingMethod,
  type PaymentMethod,
} from "./model";
function read(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") as unknown;
  } catch {
    return null;
  }
}
type Store = {
  cart: Cart;
  orders: Order[];
  storageError: boolean;
  setQuantity: (id: string, qty: number) => void;
  add: (id: string, qty: number) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  setStage: (id: string, stage: number) => void;
  place: (shipping?: ShippingMethod, payment?: PaymentMethod) => Order;
  clearHistory: () => void;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(() =>
    cleanCart(read("reloop.cart.v1")),
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    cleanOrders(read("reloop.orders.v1")),
  );
  const [wishlist, setWishlist] = useState<string[]>(() =>
    cleanWishlist(read("reloop.wishlist.v1")),
  );
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem("reloop.wishlist.v1", JSON.stringify(wishlist));
      localStorage.setItem("reloop.cart.v1", JSON.stringify(cart));
      localStorage.setItem("reloop.orders.v1", JSON.stringify(orders));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [cart, orders, wishlist]);
  const setQuantity = (id: string, qty: number) =>
    setCart((old) =>
      cleanCart({ ...old, [id]: Math.max(0, Math.min(20, qty)) }),
    );
  const add = (id: string, qty: number) =>
    setCart((old) =>
      cleanCart({ ...old, [id]: Math.min(20, (old[id] || 0) + qty) }),
    );
  const place = (
    shipping: ShippingMethod = "standard",
    payment: PaymentMethod = "cod",
  ) => {
    if (!Object.keys(cart).length) throw new Error("Your bag is empty.");
    const order = {
      id:
        "RL-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).slice(2, 5).toUpperCase(),
      date: new Date().toISOString(),
      items: { ...cart },
      total: totals(cart, shipping).total,
      shipping,
      payment,
      stage: 0,
    };
    setOrders((old) => [...old.slice(-199), order]);
    setCart({});
    return order;
  };
  return (
    <Context.Provider
      value={{
        cart,
        orders,
        wishlist,
        toggleWishlist: (id) =>
          setWishlist((old) =>
            cleanWishlist(
              old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
            ),
          ),
        setStage: (id, stage) => {
          if (Number.isInteger(stage) && stage >= 0 && stage <= 3)
            setOrders((old) =>
              old.map((o) => (o.id === id ? { ...o, stage } : o)),
            );
        },
        storageError,
        setQuantity,
        add,
        place,
        clearHistory: () => setOrders([]),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const context = useContext(Context);
  if (!context) throw new Error("StoreProvider missing");
  return context;
}
