import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthenticatedUser = vi.fn();
const generateEmailVerificationLink = vi.fn();
const sendVerificationEmail = vi.fn();

vi.mock("@/server/auth", () => ({
  requireAuthenticatedUser,
}));

vi.mock("@/server/firebase-admin", () => ({
  getAdminAuth: () => ({
    generateEmailVerificationLink,
  }),
}));

vi.mock("@/server/emails/notifications", () => ({
  sendVerificationEmail,
}));

describe("POST /api/auth/email-verification", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("sends verification email for unverified users", async () => {
    requireAuthenticatedUser.mockResolvedValue({
      token: {
        uid: "user-1",
        email: "cliente@test.com",
        email_verified: false,
      },
      profile: {
        name: "Cliente",
      },
    });
    generateEmailVerificationLink.mockResolvedValue("https://verify.test");

    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost:3000/api/auth/email-verification", { method: "POST" }));

    expect(response.status).toBe(200);
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "cliente@test.com",
        actionUrl: "https://verify.test",
      }),
    );
  });
});
