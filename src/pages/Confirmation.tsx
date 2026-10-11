import { ArrowRight, Check } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Empty } from "../components";
import { impact, money, paymentMethods } from "../model";
import { useStore } from "../store";

export function Confirmation() {
  const { id } = useParams();
  const { orders } = useStore();
  const order = orders.find((o) => o.id === id);
  if (!order)
    return (
      <Empty
        title="This order isn’t on this device."
        body="Orders are stored in this browser. You can explore the collection or view any saved orders in Our impact."
      />
    );
  const estimate = impact([order]);
  return (
    <>
      <section className="confirmation">
        <span className="confirmation-check">
          <Check size={32} />
        </span>
        <p className="eyebrow accent">A small step, thoughtfully taken.</p>
        <h1>
          Good choices.
          <br />
          Great beginnings.
        </h1>
        <p>Your order has been saved. Thank you for exploring ReLoop.</p>
        <div className="order-reference">
          <strong>{order.id}</strong>
          <span>
            {new Date(order.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span>
            {estimate.items} items · {money(order.total)}
          </span>
          <span>
            Payment method: {paymentMethods[order.payment ?? "cod"].label}
          </span>
        </div>
        <p className="small muted">
          No payment has been processed and no shipment has been arranged.
        </p>
        <div className="confirmation-impact">
          <p>
            <strong>{estimate.co2.toFixed(2)} kg</strong>
            <span>CO₂e · illustrative estimate</span>
          </p>
          <p>
            <strong>{estimate.plastic} g</strong>
            <span>Plastic · illustrative estimate</span>
          </p>
        </div>
        <p className="caption muted">
          Fictional learning inputs per ordered unit. These are not measured
          environmental savings.
        </p>
        <div className="confirmation-actions">
          <Link className="button secondary" to={`/orders/${order.id}`}>
            View order status
          </Link>
          <Link className="button" to="/impact">
            View your impact <ArrowRight size={18} />
          </Link>
          <Link className="button secondary" to="/shop">
            Keep exploring
          </Link>
        </div>
      </section>
    </>
  );
}
