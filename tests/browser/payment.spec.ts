import { test, expect } from "@playwright/test";
import fs from "node:fs";
test("each demo payment method is selectable, accessible and retained on saved orders", async ({
  page,
}) => {
  const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
  for (const [width, label, key] of [
    [390, "UPI", "upi"],
    [1440, "Credit / debit card", "card"],
    [390, "Cash on delivery", "cod"],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/product/steel-bottle");
    await page.getByRole("button", { name: "Add to bag — ₹699" }).click();
    await page.goto("/checkout");
    await page.getByRole("radio", { name: `${label}`, exact: true }).check();
    await expect(
      page.getByRole("radio", {
        name: `${label}`,
        exact: true,
      }),
    ).toBeChecked();
    expect(await page.locator("input[name=payment]").count()).toBe(3);
    expect(
      await page
        .locator("input")
        .evaluateAll((inputs) =>
          inputs.some((i) => /cc-number|cc-csc|cc-exp/.test(i.autocomplete)),
        ),
    ).toBe(false);
    await page.addScriptTag({ content: axe });
    expect(
      await page.evaluate(async () =>
        (
          await (window as any).axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          })
        ).violations.map((v: any) => v.id),
      ),
    ).toEqual([]);
    await page
      .getByRole("button", { name: "Use sample details", exact: true })
      .click();
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(
      page.getByText(`Payment method: ${label}`, {
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("link", { name: "View order status" }).click();
    await page.reload();
    await expect(
      page.getByText(`Payment method: ${label}`, {
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("reloop.orders.v1")!).at(-1).payment,
      ),
    ).toBe(key);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
