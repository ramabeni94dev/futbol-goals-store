import { Page } from "@playwright/test";

export async function seedMockSession(
  page: Page,
  input: {
    uid: string;
    email: string;
    displayName: string;
    role: "admin" | "customer";
    emailVerified: boolean;
  },
) {
  await page.addInitScript((session) => {
    window.localStorage.setItem("futbol-goals-store-e2e-session", JSON.stringify(session));
  }, input);
}

export async function seedCart(page: Page, cartItems: unknown) {
  await page.addInitScript((items) => {
    window.localStorage.setItem("futbol-goals-store-cart", JSON.stringify(items));
  }, cartItems);
}
