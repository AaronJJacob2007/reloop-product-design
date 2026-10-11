import rawProducts from "./data/products.json";
export type Product = (typeof rawProducts)[number];
export const products: Product[] = rawProducts;
export const categories = [
  "Reusables",
  "Home & garden",
  "Kitchen",
  "Personal care",
];
export type Cart = Record<string, number>;
export const shippingMethods = {
  standard: { label: "Standard", timing: "3–5 days", cost: 6000 },
  express: { label: "Express", timing: "1–2 days", cost: 12000 },
  overnight: { label: "Overnight", timing: "Next day", cost: 18000 },
} as const;
export type ShippingMethod = keyof typeof shippingMethods;
export const paymentMethods = {
  cod: {
    label: "Cash on delivery",
    description:
      "Explore paying at delivery. No cash collection or shipment is arranged.",
  },
  upi: {
    label: "UPI",
    description:
      "Explore a UPI checkout. No UPI ID, PIN, QR scan or payment app is needed.",
  },
  card: {
    label: "Credit / debit card",
    description:
      "Explore a card checkout. No card number, expiry, CVV or OTP is requested.",
  },
} as const;
export type PaymentMethod = keyof typeof paymentMethods;
export const orderStages = [
  "Confirmed",
  "Preparing",
  "Dispatched",
  "Delivered",
] as const;
export type Order = {
  id: string;
  date: string;
  items: Cart;
  total: number;
  shipping?: ShippingMethod;
  payment?: PaymentMethod;
  stage?: number;
};
export function cleanWishlist(value: unknown): string[] {
  return Array.isArray(value)
    ? products.filter((p) => value.includes(p.id)).map((p) => p.id)
    : [];
}
// Money stays in integer paise so arithmetic does not accumulate rounding errors.
export const money = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 ? 2 : 0,
  }).format(paise / 100);
export const ecoScore = (p: Product) =>
  Math.round(p.scores.reduce((a, b) => a + b, 0) / p.scores.length);
export function cleanCart(value: unknown): Cart {
  // Browser storage can contain stale or edited data. Keep known products only.
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: Cart = {};
  for (const p of products) {
    const qty = (value as Cart)[p.id];
    if (Number.isInteger(qty) && qty > 0 && qty <= 20) result[p.id] = qty;
  }
  return result;
}
export function totals(cart: Cart, shipping: ShippingMethod = "standard") {
  const subtotal = products.reduce(
    (sum, p) => sum + p.price * (cart[p.id] || 0),
    0,
  );
  // These delivery and tax rules are explicit academic demo assumptions.
  const delivery =
    subtotal === 0
      ? 0
      : shipping === "standard" && subtotal >= 99900
        ? 0
        : shippingMethods[shipping].cost;
  const tax = Math.round(subtotal * 0.18);
  return { subtotal, delivery, tax, total: subtotal + delivery + tax };
}
export function cleanOrders(value: unknown): Order[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (o): o is Order =>
        !!o &&
        typeof o.id === "string" &&
        o.id.length < 80 &&
        typeof o.date === "string" &&
        Number.isFinite(Date.parse(o.date)) &&
        Number.isSafeInteger(o.total) &&
        o.total > 0 &&
        Object.keys(cleanCart(o.items)).length > 0,
    )
    .slice(-200)
    .map((o) => ({
      id: o.id,
      date: o.date,
      total: o.total,
      items: cleanCart(o.items),
      payment:
        o.payment && Object.hasOwn(paymentMethods, o.payment)
          ? o.payment
          : "cod",
      shipping:
        o.shipping && Object.hasOwn(shippingMethods, o.shipping)
          ? o.shipping
          : "standard",
      stage:
        Number.isInteger(o.stage) && o.stage! >= 0 && o.stage! <= 3
          ? o.stage
          : 0,
    }));
}
export function impact(orders: Order[]) {
  // Inputs are fictional, not measured savings. Only completed orders count.
  let co2 = 0,
    plastic = 0,
    items = 0;
  for (const o of orders)
    for (const p of products) {
      const q = o.items[p.id] || 0;
      co2 += p.co2 * q;
      plastic += p.plastic * q;
      items += q;
    }
  return { co2, plastic, items };
}
export type Address = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pin: string;
};
export function validate(a: Address) {
  const e: Partial<Record<keyof Address, string>> = {};
  if (a.name.trim().length < 2) e.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email.trim()))
    e.email = "Enter a complete email address.";
  if (!/^[6-9]\d{9}$/.test(a.phone.replace(/[\s-]/g, "")))
    e.phone = "Enter a 10-digit Indian mobile number.";
  if (a.address.trim().length < 8)
    e.address = "Enter a house number and street (at least 8 characters).";
  if (a.city.trim().length < 2) e.city = "Enter your city.";
  if (!/^[1-9]\d{5}$/.test(a.pin.trim()))
    e.pin = "Enter a valid 6-digit PIN code.";
  return e;
}
