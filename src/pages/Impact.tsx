import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, Transparency } from "../components";
import { impact, money } from "../model";
import { useStore } from "../store";

export function Impact() {
  const { orders, clearHistory } = useStore();
  const [method, setMethod] = useState(false);
  const [reset, setReset] = useState(false);
  const data = impact(orders);
  return (
    <>
      <p className="eyebrow accent">A little care, over time.</p>
      <div className="page-heading">
        <div>
          <h1>
            Small choices.
            <br />A bigger picture.
          </h1>
          <p className="muted">Your saved orders, brought together.</p>
        </div>
        <button className="text-button" onClick={() => setMethod(true)}>
          How we estimate impact <ArrowRight size={16} />
        </button>
      </div>
      <div className="impact-banner">
        <strong>Illustrative estimates only</strong>
        <p>
          These counters use fictional per-product inputs to demonstrate a
          dashboard. They are not verified savings, environmental claims or
          life-cycle assessments.
        </p>
      </div>
      <section className="metrics" aria-label="Illustrative impact totals">
        <div>
          <span className="eyebrow muted">CO₂e / illustrative estimate</span>
          <strong>
            {data.co2.toFixed(2)} <small>kg</small>
          </strong>
          <p>Accumulated illustrative CO₂e</p>
        </div>
        <div>
          <span className="eyebrow muted">Plastic / illustrative estimate</span>
          <strong>
            {data.plastic} <small>g</small>
          </strong>
          <p>Accumulated illustrative plastic</p>
        </div>
        <div>
          <span className="eyebrow muted">Repeat use starts here</span>
          <strong>
            {data.items} <small>items</small>
          </strong>
          <p>
            Across {orders.length} saved{" "}
            {orders.length === 1 ? "order" : "orders"}
          </p>
        </div>
      </section>
      <section className="impact-history">
        <div className="section-heading">
          <h2>Your order journey</h2>
          {orders.length > 0 && (
            <button className="text-button" onClick={() => setReset(true)}>
              Clear order history
            </button>
          )}
        </div>
        {orders.length ? (
          orders
            .slice()
            .reverse()
            .map((o) => (
              <Link
                className="history-row"
                key={o.id}
                to={`/confirmation/${o.id}`}
              >
                <div>
                  <strong>{o.id}</strong>
                  <p className="small muted">
                    {new Date(o.date).toLocaleDateString("en-IN")} ·{" "}
                    {Object.values(o.items).reduce((a, b) => a + b, 0)} items
                  </p>
                </div>
                <span>
                  {money(o.total)} <ArrowRight size={16} />
                </span>
              </Link>
            ))
        ) : (
          <div className="no-results">
            <h2>Your journey starts with one choice.</h2>
            <p>
              Complete checkout to see its sample values here. Your bag alone
              does not change these totals.
            </p>
            <Link className="button" to="/shop">
              Explore the collection
            </Link>
          </div>
        )}
      </section>
      <section className="home-note">
        <h2>
          The most useful habit?
          <br />
          Use what you have.
        </h2>
        <p>
          Care, repair and repeat use matter. Clear product information can
          support more thoughtful choices.
        </p>
      </section>
      <Transparency />
      {method && (
        <Modal title="Behind the estimates" onClose={() => setMethod(false)}>
          <p>
            Each fictional product has a fixed CO₂e and plastic value in our
            local dataset. The dashboard multiplies those values by quantities
            in saved orders, then adds them together.
          </p>
          <p>
            Example: one bottle (1.50 kg, 80 g) + one tote (0.50 kg, 40 g) =
            2.00 kg CO₂e and 120 g plastic in the illustrative counter.
          </p>
          <p>
            These inputs are invented for learning. There is no measured
            baseline, avoided-disposal calculation or independently verified
            environmental benefit. Manufacturing, transport, lifetime use and
            end-of-life are not assessed.
          </p>
          <p>
            The separate Eco-Score averages four equally weighted 1–5 inputs:
            materials, reuse potential, packaging and sourcing transparency. The
            result is rounded to the nearest whole leaf. No certification is
            implied.
          </p>
          <button className="button full" onClick={() => setMethod(false)}>
            Understood
          </button>
        </Modal>
      )}
      {reset && (
        <Modal title="Clear order history?" onClose={() => setReset(false)}>
          <p>
            This removes saved orders and resets your illustrative impact
            counters on this device. Your shopping bag stays as it is.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              onClick={() => setReset(false)}
            >
              Keep history
            </button>
            <button
              className="button"
              onClick={() => {
                clearHistory();
                setReset(false);
              }}
            >
              Clear history
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
