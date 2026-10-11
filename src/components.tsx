import { Heart, Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ecoScore,
  money,
  totals,
  type Cart,
  type Product,
  type ShippingMethod,
} from "./model";
import { useStore } from "./store";
export function WishlistButton({ product }: { product: Product }) {
  const { wishlist, toggleWishlist } = useStore();
  const saved = wishlist.includes(product.id);
  return (
    <button
      type="button"
      className="wishlist-button"
      aria-pressed={saved}
      aria-label={`${saved ? "Remove" : "Save"} ${product.name} ${saved ? "from" : "to"} wishlist`}
      onClick={() => toggleWishlist(product.id)}
    >
      <Heart size={20} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
export function EcoScore({ product }: { product: Product }) {
  const score = ecoScore(product);
  return (
    <span className="eco" aria-label={`Eco-Score ${score} out of 5`}>
      <span aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <img
            className={i < score ? "" : "unfilled"}
            key={i}
            src="/art/leaf.svg"
            alt=""
            width="16"
            height="16"
          />
        ))}
      </span>
      <small>{score}/5</small>
    </span>
  );
}
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <article className="product-card">
      <WishlistButton product={p} />
      <Link
        className={`product-art ${p.art}`}
        to={`/product/${p.id}`}
        aria-label={`View ${p.name}`}
      >
        <img
          src={p.image}
          alt={p.imageAlt}
          width="296"
          height="370"
          style={{ objectPosition: p.imagePosition }}
          loading="lazy"
        />
      </Link>
      <p className="eyebrow muted">{p.category}</p>
      <Link className="product-name" to={`/product/${p.id}`}>
        {p.name}
      </Link>
      <p className="small muted">{p.size}</p>
      <div className="card-bottom">
        <strong>{money(p.price)}</strong>
        <EcoScore product={p} />
      </div>
    </article>
  );
}
export function Quantity({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="quantity">
      <button
        type="button"
        disabled={value <= 1}
        aria-label={`Decrease quantity of ${label}`}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={16} />
      </button>
      <output aria-label={`Quantity of ${label}`} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        disabled={value >= 20}
        aria-label={`Increase quantity of ${label}`}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
export function Summary({
  cart,
  shipping = "standard",
  children,
}: {
  cart: Cart;
  shipping?: ShippingMethod;
  children?: ReactNode;
}) {
  const t = totals(cart, shipping);
  return (
    <aside className="summary">
      <h2>Order summary</h2>
      <dl>
        <div>
          <dt>Subtotal</dt>
          <dd>{money(t.subtotal)}</dd>
        </div>
        <div>
          <dt>Delivery</dt>
          <dd>{t.delivery ? money(t.delivery) : "Free"}</dd>
        </div>
        <div>
          <dt>Illustrative tax (18%)</dt>
          <dd>{money(t.tax)}</dd>
        </div>
        <div className="total">
          <dt>Total</dt>
          <dd>{money(t.total)}</dd>
        </div>
      </dl>
      {shipping === "standard" && t.delivery > 0 && (
        <p className="small muted">
          Add {money(99900 - t.subtotal)} more for free standard delivery.
        </p>
      )}
      {children}
      <p className="caption muted">
        Standard delivery is ₹60 below ₹999 and free from ₹999. Express is ₹120;
        overnight is ₹180. Tax is an illustrative estimate.
      </p>
    </aside>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="modal-head">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Empty({
  title,
  body,
  action = "Explore the collection",
  to = "/shop",
}: {
  title: string;
  body: string;
  action?: string;
  to?: string;
}) {
  return (
    <section className="empty">
      <span className="section-number">RELOOP / EVERYDAY, CONSIDERED</span>
      <h1>{title}</h1>
      <p>{body}</p>
      <Link className="button" to={to}>
        {action}
      </Link>
    </section>
  );
}
export function Transparency() {
  return (
    <div className="transparency">
      <strong>Thoughtful choices start with clear information.</strong>
      <p>
        Explore materials, care and repeat use. Eco-Scores and environmental
        figures are illustrative, not independently certified.
      </p>
    </div>
  );
}
