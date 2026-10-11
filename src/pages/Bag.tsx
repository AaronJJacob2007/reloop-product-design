import { ArrowRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  EcoScore,
  Empty,
  Modal,
  Quantity,
  Summary,
  Transparency,
} from "../components";
import { money, products, type Product } from "../model";
import { useStore } from "../store";

export function Bag() {
  const { cart, setQuantity } = useStore();
  const [remove, setRemove] = useState<Product | null>(null);
  const entries = products.filter((p) => cart[p.id]);
  const count = Object.values(cart).reduce((s, q) => s + q, 0);
  if (!entries.length)
    return (
      <Empty
        title="Room for something considered."
        body="Your bag is empty. Start with one useful thing you’ll reach for again and again."
      />
    );
  return (
    <>
      <p className="eyebrow accent">Your collection, in the making</p>
      <div className="page-heading">
        <h1>Your bag.</h1>
        <p className="muted">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>
      <div className="checkout-layout">
        <section aria-label="Bag items">
          <div className="bag-list">
            {entries.map((p) => (
              <article className="bag-item" key={p.id}>
                <Link
                  to={`/product/${p.id}`}
                  className={`bag-art ${p.art}`}
                  aria-label={`View ${p.name}`}
                >
                  <img
                    src={p.image}
                    alt=""
                    style={{ objectPosition: p.imagePosition }}
                    width="120"
                    height="112"
                  />
                </Link>
                <div>
                  <Link className="product-name" to={`/product/${p.id}`}>
                    {p.name}
                  </Link>
                  <p className="small muted">{p.size}</p>
                  <EcoScore product={p} />
                  <div className="bag-item-controls">
                    <Quantity
                      value={cart[p.id]}
                      onChange={(q) => setQuantity(p.id, q)}
                      label={p.name}
                    />
                    <button
                      className="text-button remove-button"
                      onClick={() => setRemove(p)}
                      aria-label={`Remove ${p.name}`}
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
                <strong className="line-price">
                  {money(p.price * cart[p.id])}
                </strong>
              </article>
            ))}
          </div>
          <Link to="/shop" className="text-link">
            Continue exploring <ArrowRight size={16} />
          </Link>
        </section>
        <Summary cart={cart}>
          <Link className="button full" to="/checkout">
            Continue to checkout <ArrowRight size={18} />
          </Link>
        </Summary>
      </div>
      <Transparency />
      {remove && (
        <Modal title="Remove this item?" onClose={() => setRemove(null)}>
          <p>Remove {remove.name} from your bag?</p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setRemove(null)}
            >
              Keep item
            </button>
            <button
              className="button"
              onClick={() => {
                setQuantity(remove.id, 0);
                setRemove(null);
              }}
            >
              Remove item
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
