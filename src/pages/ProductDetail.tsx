import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  EcoScore,
  Empty,
  ProductCard,
  Quantity,
  WishlistButton,
} from "../components";
import { money, products } from "../model";
import { useStore } from "../store";

export function ProductDetail() {
  const { id } = useParams();
  const p = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add, cart } = useStore();
  if (!p)
    return (
      <Empty
        title="We couldn’t find that product."
        body="Explore the collection to find your next everyday essential."
      />
    );
  const current = cart[p.id] || 0;
  const room = 20 - current;
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/shop">Collection</Link>
        <span>/</span>
        <span>{p.name}</span>
      </nav>
      <section className="product-detail">
        <div className={`detail-art ${p.art}`}>
          <img
            src={p.image}
            alt={p.imageAlt}
            width="800"
            height="1000"
            style={{ objectPosition: p.imagePosition }}
          />
          <p className="caption">
            Representative product photograph
            <br />
            <a href={p.photoSource} target="_blank" rel="noreferrer">
              Photo source: Pexels
            </a>
          </p>
        </div>
        <div className="product-info">
          <p className="eyebrow accent">
            {p.category} / Considered everyday goods
          </p>
          <div className="detail-title">
            <h1>{p.name}</h1>
            <WishlistButton product={p} />
          </div>
          <p className="muted">{p.size}</p>
          <div className="detail-price">
            <strong>{money(p.price)}</strong>
            <EcoScore product={p} />
          </div>
          <p>{p.description}</p>
          <div className="buy-row">
            <Quantity
              value={qty}
              onChange={(v) => {
                setQty(v);
                setAdded(false);
              }}
              label={p.name}
            />
            <button
              className="button"
              disabled={room === 0}
              onClick={() => {
                add(p.id, Math.min(qty, room));
                setAdded(true);
              }}
            >
              {room === 0
                ? "Bag limit reached"
                : `Add to bag — ${money(p.price * Math.min(qty, Math.max(1, room)))}`}
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="added-message" role="status">
            {added && (
              <>
                <Check size={16} /> Added to your bag.{" "}
                <Link to="/bag">View bag</Link>
              </>
            )}
            {room === 0 && (
              <span>
                Maximum 20 per product. Change quantities in your bag.
              </span>
            )}
          </div>
          <p className="small muted">Free standard delivery from ₹999.</p>
          <details open>
            <summary>Materials & care</summary>
            <p>{p.material}</p>
            <p>{p.care}</p>
          </details>
          <details>
            <summary>Why this Eco-Score?</summary>
            <p>
              Our illustrative rubric scores four factors equally, then rounds
              their average to 1–5 leaves. Scores are illustrative values, not
              verified product assessments.
            </p>
            <dl className="score-breakdown">
              {[
                "Materials",
                "Reuse potential",
                "Packaging",
                "Sourcing transparency",
              ].map((s, i) => (
                <div key={s}>
                  <dt>{s}</dt>
                  <dd>{p.scores[i]}/5</dd>
                </div>
              ))}
            </dl>
            <p>No product certifications are claimed.</p>
          </details>
          <details>
            <summary>Illustrative impact assumptions</summary>
            <p>
              This item contributes {p.co2.toFixed(2)} kg CO₂e and {p.plastic} g
              plastic to the illustrative counter per unit ordered. These are
              invented learning inputs, not measured savings or a life-cycle
              assessment. Real outcomes depend on manufacture, transport, repeat
              use and disposal.
            </p>
          </details>
        </div>
      </section>
      <section>
        <div className="section-heading">
          <h2>Keep the everyday considered.</h2>
          <Link className="text-link" to="/shop">
            Explore all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x.id !== p.id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
    </>
  );
}
