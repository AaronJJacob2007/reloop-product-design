import { test, expect } from "@playwright/test";
import fs from "node:fs";

test("wishlist, premium delivery, separate billing and simulated status persist without personal data", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.goto("/product/steel-bottle");
    await page
      .getByRole("button", { name: "Save Steel water bottle to wishlist" })
      .click();
    await page.goto("/wishlist");
    await page.reload();
    await expect(
      page.getByRole("link", { name: "Steel water bottle", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Remove Steel water bottle from wishlist" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Something worth coming back to." }),
    ).toBeVisible();
    await page.goto("/product/steel-bottle");
    await page.getByRole("button", { name: "Add to bag — ₹699" }).click();
    await page.goto("/checkout");
    await page
      .getByRole("button", { name: "Use sample details", exact: true })
      .click();
    await page.getByRole("radio", { name: /Express/ }).check();
    await expect(page.locator(".summary .total")).toContainText("₹944.82");
    await page.getByRole("radio", { name: /Overnight/ }).check();
    await expect(page.locator(".summary .total")).toContainText("₹1,004.82");
    await page
      .getByRole("checkbox", {
        name: "Billing address is the same as delivery",
      })
      .uncheck();
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(
      page.getByText(
        "Check the highlighted billing details before continuing.",
      ),
    ).toBeVisible();
    await expect(page.locator("#billing-name")).toBeFocused();
    await page
      .getByRole("button", { name: "Use sample billing details" })
      .click();
    const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
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
    await page.getByRole("button", { name: "Place order" }).click();
    await page.getByRole("link", { name: "View order status" }).click();
    await page.getByText("Preview order stages", { exact: true }).click();
    await page.getByRole("button", { name: "Preview next stage" }).click();
    await page.reload();
    await page.getByText("Preview order stages", { exact: true }).click();
    await expect(page.locator(".status-controls [role=status]")).toContainText(
      "Preparing",
    );
    await expect(
      page.getByText("Overnight · Next day · estimated"),
    ).toBeVisible();
    for (let i = 0; i < 2; i++)
      await page.getByRole("button", { name: "Preview next stage" }).click();
    await expect(
      page.getByRole("button", { name: "Preview complete" }),
    ).toBeDisabled();
    await page.getByRole("button", { name: "Reset preview" }).click();
    await expect(page.locator(".status-controls [role=status]")).toContainText(
      "Confirmed",
    );
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
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toMatch(
      /demo@example|Sample Street|Example Road|billing@example/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/orders");
    await expect(page.locator(".order-history-row")).toHaveCount(1);
  }
});
