import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const screenshots = path.resolve("test-results/screenshots");
test("remaining checkout states are accessible on mobile and desktop", async ({
  page,
}) => {
  const axe = fs.readFileSync(
    path.resolve("node_modules/axe-core/axe.min.js"),
    "utf8",
  );
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/product/steel-bottle");
    await page.getByRole("button", { name: "Add to bag — ₹699" }).click();
    for (const route of ["/bag", "/checkout"]) {
      await page.goto(route);
      await page.addScriptTag({ content: axe });
      const violations = await page.evaluate(async () =>
        (
          await (window as any).axe.run(document, {
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
          })
        ).violations.map((v: any) => v.id),
      );
      expect(violations, `${route} ${width}px`).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.getByRole("button", { name: "Use sample details" }).click();
    await page.getByRole("button", { name: "Place order" }).click();
    await expect(
      page.getByRole("heading", { name: "Good choices. Great beginnings." }),
    ).toBeVisible();
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
    await page.goto("/shop");
    if (width === 390) {
      await page.getByRole("button", { name: "Filters", exact: true }).click();
      await page.addScriptTag({ content: axe });
      expect(
        await page.evaluate(async () =>
          (
            await (window as any).axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            })
          ).violations.map((v: any) => v.id),
        ),
      ).toEqual([]);
      await page.keyboard.press("Escape");
    }
  }
});
test("desktop shopping, validation, persistence and order impact", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Less, but better." }),
  ).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(screenshots, { recursive: true });
  await page.screenshot({
    path: path.join(screenshots, "01-desktop-home.png"),
    fullPage: true,
  });
  await page
    .getByRole("link", { name: /Explore the collection/ })
    .first()
    .click();
  await page
    .getByLabel("Search the collection", { exact: true })
    .fill("steel water");
  await expect(page.getByRole("status")).toHaveText(/1 product/);
  await page
    .getByRole("link", { name: "Steel water bottle", exact: true })
    .click();
  await page.getByRole("button", { name: "Add to bag — ₹699" }).click();
  await expect(page.locator(".added-message")).toContainText(
    "Added to your bag",
  );
  await page.goto("/product/canvas-tote");
  await page.getByRole("button", { name: "Add to bag — ₹399" }).click();
  await page.getByRole("link", { name: "View bag", exact: true }).click();
  await expect(page.getByText("₹1,295.64", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("₹1,295.64", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.locator("[aria-invalid=true]")).toHaveCount(6);
  await expect(page.locator("#name")).toBeFocused();
  await page.getByRole("button", { name: "Use sample details" }).click();
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(
    page.getByRole("heading", { name: "Good choices. Great beginnings." }),
  ).toBeVisible();
  const stored = await page.evaluate(() =>
    localStorage.getItem("reloop.orders.v1"),
  );
  expect(stored).not.toContain("demo@example.com");
  expect(stored).not.toContain("9000000000");
  await page.getByRole("link", { name: "View your impact" }).click();
  await expect(page.locator(".metrics")).toContainText("2.00");
  await expect(page.locator(".metrics")).toContainText("120");
  await page.reload();
  await expect(page.locator(".metrics")).toContainText("120");
  await page.screenshot({
    path: path.join(screenshots, "04-desktop-impact.png"),
    fullPage: true,
  });
  await page.goto("/bag");
  await expect(
    page.getByRole("heading", { name: "Room for something considered." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile filtering, sort, quantity, removal and no overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: path.join(screenshots, "02-mobile-home.png"),
    fullPage: true,
  });
  const mobileSearch = page.getByLabel("Search considered goods", {
    exact: true,
  });
  await expect(mobileSearch).toBeVisible();
  await mobileSearch.fill("tote");
  await mobileSearch.press("Enter");
  await expect(page).toHaveURL(/\/shop\?q=tote$/);
  await expect(page.getByRole("status")).toHaveText(/3 products/);
  await page.goto("/shop");
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Category", { exact: true })
    .selectOption("Personal care");
  await page.getByRole("button", { name: "Show products" }).click();
  await expect(page.getByRole("status")).toHaveText(/1 product/);
  await page
    .getByLabel("Search the collection", { exact: true })
    .fill("does not exist");
  await expect(
    page.getByRole("heading", { name: "No matches, yet." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset search & filters" }).click();
  await expect(page.getByRole("status")).toHaveText(/12 products/);
  await page.getByLabel("Sort by").selectOption("price-low");
  await expect(page.locator(".product-name").first()).toHaveText(
    "Bamboo brush set",
  );
  await page.goto("/product/steel-bottle");
  await page
    .getByRole("button", { name: "Increase quantity of Steel water bottle" })
    .click();
  await page.getByRole("button", { name: "Add to bag — ₹1,398" }).click();
  await page.goto("/bag");
  await expect(
    page.getByLabel("Quantity of Steel water bottle", { exact: true }),
  ).toHaveText("2");
  await page
    .getByRole("button", { name: "Decrease quantity of Steel water bottle" })
    .click();
  await expect(page.getByText("₹884.82", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Remove Steel water bottle" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Remove Steel water bottle" }).click();
  await page.getByRole("button", { name: "Remove item", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Room for something considered." }),
  ).toBeVisible();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/shop", "/product/steel-bottle", "/impact"]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} at ${width}px`,
      ).toBe(true);
    }
  }
});
test("accessibility audit of key routes", async ({ page }) => {
  const axe = fs.readFileSync(
    path.resolve("node_modules/axe-core/axe.min.js"),
    "utf8",
  );
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/shop", "/product/steel-bottle", "/impact"]) {
      await page.goto(route);
      await page.addScriptTag({ content: axe });
      const violations = await page.evaluate(async () => {
        const result = await (window as any).axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
        });
        return result.violations.map((v: any) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n: any) => n.target),
        }));
      });
      expect(violations, `${route} ${width}px`).toEqual([]);
    }
  }
});
test("production service worker precaches and reopens deep routes offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons).toHaveLength(3);
  await page.goto("/product/steel-bottle");
  await page.getByRole("button", { name: "Add to bag — ₹699" }).click();
  await context.setOffline(true);
  await page.goto("/bag");
  await expect(page.getByRole("heading", { name: "Your bag." })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Your bag." })).toBeVisible();
  await page.goto("/product/canvas-tote");
  await expect(
    page.getByRole("heading", { name: "Everyday canvas tote" }),
  ).toBeVisible();
  expect(
    await page
      .locator(".detail-art img")
      .evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      ),
  ).toBe(true);
  await context.setOffline(false);
});
