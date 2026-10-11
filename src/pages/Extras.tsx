import { Link, useParams } from "react-router-dom";
import { Empty, ProductCard } from "../components";
import {
  money,
  orderStages,
  products,
  shippingMethods,
  paymentMethods,
} from "../model";
import { useStore } from "../store";

export function Wishlist() {
  const { wishlist } = useStore();
  const saved = products.filter((p) => wishlist.includes(p.id));
  return (
    <>
      <p className="eyebrow accent">Keep a little inspiration</p>
      <h1>Your wishlist.</h1>
      <p className="muted">
        Saved on this device. A little time to consider your next everyday
        essential.
      </p>
      {saved.length ? (
        <div className="product-grid">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <Empty
          title="Something worth coming back to."
          body="Tap a heart on any product to save it here."
        />
      )}
    </>
  );
}

export function Orders() {
  const { id } = useParams();
  const { orders, setStage } = useStore();
  const order = orders.find((o) => o.id === id);
  if (id && !order)
    return (
      <Empty
        title="This order isn’t on this device."
        body="Orders are saved only in the browser where they were placed."
      />
    );
  if (!id)
    return (
      <>
        <p className="eyebrow accent">Your considered choices</p>
        <h1>Your orders.</h1>
        <p className="muted">Your order history, saved on this device.</p>
        {orders.length ? (
          <div className="order-list">
            {[...orders].reverse().map((o) => (
              <Link
                className="order-history-row"
                to={`/orders/${o.id}`}
                key={o.id}
              >
                <strong>{o.id}</strong>
                <span>{new Date(o.date).toLocaleDateString("en-IN")}</span>
                <span>{orderStages[o.stage ?? 0]}</span>
                <strong>{money(o.total)}</strong>
              </Link>
            ))}
          </div>
        ) : (
          <Empty
            title="Your story starts with one useful thing."
            body="Complete checkout to see an order here."
          />
        )}
      </>
    );
  if (!order) return null;
  const stage = order.stage ?? 0;
  const shipping = shippingMethods[order.shipping ?? "standard"];
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/orders">Your orders</Link>
        <span>/</span>
        <span>{order.id}</span>
      </nav>
      <p className="eyebrow accent">Every step, at a glance</p>
      <h1>Order status.</h1>
      <p className="muted">
        {order.id} · {new Date(order.date).toLocaleDateString("en-IN")}
      </p>
      <ol className="order-timeline" aria-label="Order stages">
        {orderStages.map((label, i) => (
          <li
            key={label}
            className={i <= stage ? "complete" : ""}
            aria-current={i === stage ? "step" : undefined}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
            <small>
              {i < stage
                ? "Complete"
                : i === stage
                  ? "Current stage"
                  : "Upcoming"}
            </small>
          </li>
        ))}
      </ol>
      <details className="order-preview-tools">
        <summary>Preview order stages</summary>
        <p className="small muted">
          These controls preview the delivery journey. This order has no live
          courier tracking or shipment.
        </p>{" "}
        <div className="status-controls">
          <p role="status">
            Current stage: <strong>{orderStages[stage]}</strong>
          </p>
          <button
            className="button"
            disabled={stage === 3}
            onClick={() => setStage(order.id, stage + 1)}
          >
            {stage === 3 ? "Preview complete" : "Preview next stage"}
          </button>
          <button
            className="text-button"
            disabled={stage === 0}
            onClick={() => setStage(order.id, 0)}
          >
            Reset preview
          </button>
        </div>
      </details>
      <section className="form-section">
        <h2>Your order</h2>
        <p>Payment method: {paymentMethods[order.payment ?? "cod"].label}</p>
        <p>
          {shipping.label} · {shipping.timing} · estimated
        </p>
        {products
          .filter((p) => order.items[p.id])
          .map((p) => (
            <div className="checkout-line" key={p.id}>
              <Link to={`/product/${p.id}`}>
                {p.name} × {order.items[p.id]}
              </Link>
              <strong>{money(p.price * order.items[p.id])}</strong>
            </div>
          ))}
        <div className="checkout-line">
          <strong>Order total</strong>
          <strong>{money(order.total)}</strong>
        </div>
        <p className="small muted">
          No payment was collected. Delivery and billing addresses are not
          stored.
        </p>
      </section>
    </>
  );
}
