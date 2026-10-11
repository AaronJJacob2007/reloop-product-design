import { ArrowRight } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Empty, Summary } from "../components";
import {
  money,
  products,
  validate,
  shippingMethods,
  paymentMethods,
  type PaymentMethod,
  type ShippingMethod,
  type Address,
} from "../model";
import { useStore } from "../store";

const emptyAddress: Address = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  pin: "",
};
export function Checkout() {
  const { cart, place } = useStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [billing, setBilling] = useState<Address>(emptyAddress);
  const [sameBilling, setSameBilling] = useState(true);
  const [billingErrors, setBillingErrors] = useState<
    ReturnType<typeof validate>
  >({});
  const [shipping, setShipping] = useState<ShippingMethod>("standard");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  if (!Object.keys(cart).length)
    return (
      <Empty
        title="Your bag comes first."
        body="Add an everyday essential before continuing to checkout."
      />
    );
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = validate(address);
    setErrors(next);
    const nextBilling = sameBilling ? {} : validate(billing);
    setBillingErrors(nextBilling);
    if (Object.keys(next).length || Object.keys(nextBilling).length) {
      const key = Object.keys(next).length
        ? Object.keys(next)[0]
        : `billing-${Object.keys(nextBilling)[0]}`;
      formRef.current?.querySelector<HTMLInputElement>(`#${key}`)?.focus();
      return;
    }
    if (busy) return;
    setBusy(true);
    const order = place(shipping, payment);
    navigate(`/confirmation/${order.id}`, { replace: true });
  };
  const labels: Record<keyof Address, string> = {
    name: "Full name",
    email: "Email address",
    phone: "Mobile number",
    address: "Street address",
    city: "City",
    pin: "PIN code",
  };
  const autocomplete: Record<keyof Address, string> = {
    name: "name",
    email: "email",
    phone: "tel-national",
    address: "street-address",
    city: "address-level2",
    pin: "postal-code",
  };
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/bag">Your bag</Link>
        <span>/</span>
        <span>Checkout</span>
      </nav>
      <h1>Almost yours.</h1>
      <p className="muted">Your essentials, one step closer.</p>
      <div className="checkout-layout">
        <form ref={formRef} id="checkout-form" noValidate onSubmit={submit}>
          <section className="form-section">
            <div className="section-heading">
              <h2>01 / Delivery details</h2>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setAddress({
                    name: "Demo Shopper",
                    email: "demo@example.com",
                    phone: "9000000000",
                    address: "12 Sample Street",
                    city: "Navi Mumbai",
                    pin: "400703",
                  });
                  setErrors({});
                }}
              >
                Use sample details
              </button>
            </div>
            <p className="small muted">
              All fields required. Use sample details; nothing is sent to a
              server. Delivery details are discarded when you leave this page.
            </p>
            {Object.keys(errors).length > 0 && (
              <p className="error-summary" role="alert">
                Check the highlighted delivery details before continuing.
              </p>
            )}
            <div className="form-grid">
              {(Object.keys(labels) as (keyof Address)[]).map((key) => (
                <label
                  key={key}
                  className={key === "address" ? "span-two" : ""}
                  htmlFor={key}
                >
                  {labels[key]}
                  <input
                    id={key}
                    name={key}
                    type={
                      key === "email"
                        ? "email"
                        : key === "phone"
                          ? "tel"
                          : "text"
                    }
                    autoComplete={autocomplete[key]}
                    inputMode={
                      key === "phone"
                        ? "tel"
                        : key === "pin"
                          ? "numeric"
                          : undefined
                    }
                    maxLength={key === "pin" ? 6 : key === "phone" ? 14 : 160}
                    value={address[key]}
                    required
                    aria-invalid={!!errors[key]}
                    aria-describedby={errors[key] ? `${key}-error` : undefined}
                    onChange={(e) => {
                      setAddress({ ...address, [key]: e.target.value });
                      setErrors((old) => {
                        const next = { ...old };
                        delete next[key];
                        return next;
                      });
                    }}
                    onBlur={() => {
                      const error = validate(address)[key];
                      if (address[key] || errors[key])
                        setErrors((old) => {
                          const next = { ...old };
                          if (error) next[key] = error;
                          else delete next[key];
                          return next;
                        });
                    }}
                  />
                  {errors[key] && (
                    <span className="field-error" id={`${key}-error`}>
                      {errors[key]}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </section>
          <section className="form-section">
            <h2>02 / Billing details</h2>
            <label className="payment-option">
              <input
                type="checkbox"
                checked={sameBilling}
                onChange={(e) => {
                  setSameBilling(e.target.checked);
                  setBillingErrors({});
                }}
              />
              Billing address is the same as delivery
            </label>
            {!sameBilling && (
              <>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setBilling({
                      name: "Demo Billing",
                      email: "billing@example.com",
                      phone: "9000000000",
                      address: "24 Example Road",
                      city: "Navi Mumbai",
                      pin: "400703",
                    });
                    setBillingErrors({});
                  }}
                >
                  Use sample billing details
                </button>
                {Object.keys(billingErrors).length > 0 && (
                  <p className="error-summary" role="alert">
                    Check the highlighted billing details before continuing.
                  </p>
                )}
                <div className="form-grid">
                  {(Object.keys(labels) as (keyof Address)[]).map((key) => (
                    <label
                      key={key}
                      className={key === "address" ? "span-two" : ""}
                      htmlFor={`billing-${key}`}
                    >
                      Billing {labels[key].toLowerCase()}
                      <input
                        id={`billing-${key}`}
                        name={`billing-${key}`}
                        type={
                          key === "email"
                            ? "email"
                            : key === "phone"
                              ? "tel"
                              : "text"
                        }
                        autoComplete={`billing ${autocomplete[key]}`}
                        inputMode={
                          key === "pin"
                            ? "numeric"
                            : key === "phone"
                              ? "tel"
                              : undefined
                        }
                        maxLength={
                          key === "pin" ? 6 : key === "phone" ? 14 : 160
                        }
                        value={billing[key]}
                        required
                        aria-invalid={!!billingErrors[key]}
                        aria-describedby={
                          billingErrors[key]
                            ? `billing-${key}-error`
                            : undefined
                        }
                        onChange={(e) => {
                          setBilling({ ...billing, [key]: e.target.value });
                          setBillingErrors((old) => {
                            const next = { ...old };
                            delete next[key];
                            return next;
                          });
                        }}
                        onBlur={() => {
                          const error = validate(billing)[key];
                          if (billing[key] || billingErrors[key])
                            setBillingErrors((old) => {
                              const next = { ...old };
                              if (error) next[key] = error;
                              else delete next[key];
                              return next;
                            });
                        }}
                      />
                      {billingErrors[key] && (
                        <span
                          className="field-error"
                          id={`billing-${key}-error`}
                        >
                          {billingErrors[key]}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </>
            )}
          </section>
          <fieldset className="form-section shipping-options">
            <legend>03 / Delivery service</legend>
            <p className="small muted">
              Free delivery from ₹999 applies to Standard only. Prices and
              timings are illustrative.
            </p>
            {(Object.keys(shippingMethods) as ShippingMethod[]).map(
              (method) => (
                <label className="shipping-option" key={method}>
                  <input
                    type="radio"
                    name="shipping"
                    value={method}
                    checked={shipping === method}
                    onChange={() => setShipping(method)}
                  />
                  <span>
                    <strong>{shippingMethods[method].label}</strong>
                    <small>{shippingMethods[method].timing}</small>
                  </span>
                  <span>
                    {method === "standard"
                      ? "₹60 · free from ₹999"
                      : money(shippingMethods[method].cost)}
                  </span>
                </label>
              ),
            )}
          </fieldset>
          <fieldset className="form-section shipping-options">
            <legend>04 / Payment method</legend>
            <p className="small muted">
              Preview checkout only. No payment is processed and no shipment is
              arranged. Please do not enter real payment credentials.
            </p>
            {(Object.keys(paymentMethods) as PaymentMethod[]).map((method) => (
              <label className="shipping-option" key={method}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === method}
                  onChange={() => setPayment(method)}
                />
                <span>
                  <strong>{paymentMethods[method].label}</strong>
                </span>
              </label>
            ))}
            <p className="small muted" role="status">
              {paymentMethods[payment].description}
            </p>
          </fieldset>
          <section className="form-section">
            <h2>05 / Review your bag</h2>
            {products
              .filter((p) => cart[p.id])
              .map((p) => (
                <div className="checkout-line" key={p.id}>
                  <span>
                    {p.name} × {cart[p.id]}
                  </span>
                  <strong>{money(p.price * cart[p.id])}</strong>
                </div>
              ))}
            <Link className="text-link" to="/bag">
              Edit your bag
            </Link>
          </section>
        </form>
        <Summary cart={cart} shipping={shipping}>
          <button
            className="button full"
            type="submit"
            form="checkout-form"
            disabled={busy}
          >
            {busy ? "Placing order…" : "Place order"}
            <ArrowRight size={18} />
          </button>
          <p className="small muted">
            Submitting saves your order on this device and clears your bag.
            Personal delivery and billing details are not saved.
          </p>
        </Summary>
      </div>
    </>
  );
}
