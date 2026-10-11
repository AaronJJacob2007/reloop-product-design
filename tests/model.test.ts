import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanCart,
  cleanOrders,
  ecoScore,
  impact,
  products,
  totals,
  validate,
  cleanWishlist,
} from "../src/model.ts";

test("shipping selection preserves standard boundary and charges premium services", () => {
  assert.equal(totals({ "steel-bottle": 1 }, "express").delivery, 12000);
  assert.equal(
    totals({ "steel-bottle": 1, "canvas-tote": 1 }, "overnight").total,
    147564,
  );
  assert.equal(totals({}, "overnight").total, 0);
});
test("saved products and legacy order histories are safely restored", () => {
  assert.deepEqual(cleanWishlist(["steel-bottle", "steel-bottle", "unknown"]), [
    "steel-bottle",
  ]);
  const base = {
    id: "demo",
    date: "2026-10-11",
    items: { "steel-bottle": 1 },
    total: 88482,
  };
  assert.equal(cleanOrders([base])[0].shipping, "standard");
  assert.equal(cleanOrders([base])[0].payment, "cod");
  assert.equal(cleanOrders([{ ...base, payment: "bad" }])[0].payment, "cod");
  assert.equal(cleanOrders([{ ...base, payment: "upi" }])[0].payment, "upi");
  assert.equal(cleanOrders([{ ...base, payment: "card" }])[0].payment, "card");
  assert.equal(
    cleanOrders([{ ...base, shipping: "bad", stage: 99 }])[0].stage,
    0,
  );
  assert.equal(
    cleanOrders([{ ...base, shipping: "express", stage: 2 }])[0].shipping,
    "express",
  );
});
test("cart totals use integer paise and the documented example", () => {
  assert.deepEqual(totals({ "steel-bottle": 1, "canvas-tote": 1 }), {
    subtotal: 109800,
    delivery: 0,
    tax: 19764,
    total: 129564,
  });
});
test("delivery boundary, empty bag and rounding", () => {
  assert.equal(totals({ "balcony-pail": 1 }).delivery, 0);
  assert.equal(totals({ "steel-bottle": 1 }).delivery, 6000);
  assert.deepEqual(totals({}), { subtotal: 0, delivery: 0, tax: 0, total: 0 });
  assert.equal(totals({ "bamboo-brush": 1 }).tax, 3582);
});
test("unsafe or stale browser storage is discarded", () => {
  assert.deepEqual(
    cleanCart({
      "steel-bottle": 2,
      unknown: 1,
      "canvas-tote": -3,
      "bamboo-brush": 21,
    }),
    { "steel-bottle": 2 },
  );
  for (const value of [null, "bad", [], { "steel-bottle": 1.5 }])
    assert.deepEqual(cleanCart(value), {});
  assert.deepEqual(cleanOrders([{ id: 1 }]), []);
});
test("impact counts completed quantities and scores match rubric", () => {
  assert.equal(ecoScore(products[0]), 4);
  assert.deepEqual(impact([]), { co2: 0, plastic: 0, items: 0 });
  const result = impact([
    {
      id: "demo",
      date: "2026-10-11",
      items: { "steel-bottle": 1, "canvas-tote": 1 },
      total: 129564,
    },
  ]);
  assert.deepEqual(result, { co2: 2, plastic: 120, items: 2 });
  assert.equal(products.length, 12);
  for (const p of products) {
    assert(p.scores.every((s) => s >= 1 && s <= 5));
    assert(p.price > 0);
  }
});
test("checkout rejects incomplete fields and accepts sample details", () => {
  assert.equal(
    Object.keys(
      validate({
        name: "",
        email: "bad",
        phone: "123",
        address: "",
        city: "",
        pin: "000000",
      }),
    ).length,
    6,
  );
  assert.deepEqual(
    validate({
      name: "Demo Shopper",
      email: "demo@example.com",
      phone: "9000000000",
      address: "12 Sample Street",
      city: "Navi Mumbai",
      pin: "400703",
    }),
    {},
  );
});
