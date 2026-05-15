import { test, expect, type APIRequestContext } from "@playwright/test";

const BACKEND = "http://localhost:3000";
const WEBHOOK_PATH = "/api/webhooks";

// ── Helpers ───────────────────────────────────────────────────────────────────

function webhookUrl(secret?: string) {
  const url = new URL(`${BACKEND}${WEBHOOK_PATH}`);
  if (secret) url.searchParams.set("secret", secret);
  return url.toString();
}

function webhookMultipart(from: string, subject = "Test", text = "Test body") {
  return { multipart: { from, subject, text } };
}

async function signInAsAdmin(ctx: APIRequestContext) {
  const res = await ctx.post(`${BACKEND}/api/auth/sign-in/email`, {
    data: {
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
    },
  });
  expect(res.ok(), "Admin sign-in failed").toBeTruthy();
}

// ── Secret validation ─────────────────────────────────────────────────────────

test.describe("Webhook — secret validation", () => {
  const SENDER = "any@example.com";
  const SECRET = process.env.WEBHOOK_SECRET!;

  test("returns 401 when no secret is provided", async ({ request }) => {
    const res = await request.post(
      `${BACKEND}${WEBHOOK_PATH}`,
      webhookMultipart(SENDER)
    );
    expect(res.status()).toBe(401);
    expect(await res.json()).toMatchObject({ error: /unauthorized/i });
  });

  test("returns 401 when secret is wrong", async ({ request }) => {
    const res = await request.post(
      webhookUrl("wrong-secret"),
      webhookMultipart(SENDER)
    );
    expect(res.status()).toBe(401);
  });

  test("accepts valid secret in ?secret query param", async ({ request }) => {
    const res = await request.post(
      webhookUrl(SECRET),
      webhookMultipart(SENDER)
    );
    expect(res.status()).toBe(200);
  });

  test("accepts valid secret in X-Webhook-Secret header", async ({
    request,
  }) => {
    const res = await request.post(`${BACKEND}${WEBHOOK_PATH}`, {
      headers: { "x-webhook-secret": SECRET },
      ...webhookMultipart(SENDER),
    });
    expect(res.status()).toBe(200);
  });
});

// ── Sender whitelist ──────────────────────────────────────────────────────────

test.describe("Webhook — sender whitelist", () => {
  const WHITELISTED = "webhook-sender@example.com";
  const SECRET = process.env.WEBHOOK_SECRET!;
  let ctx: APIRequestContext;
  let whitelistId: string;

  test.beforeAll(async ({ playwright }) => {
    ctx = await playwright.request.newContext({ baseURL: BACKEND });
    await signInAsAdmin(ctx);

    const res = await ctx.post("/api/whitelist", {
      data: { senderEmail: WHITELISTED },
    });
    expect(res.ok(), "Whitelist setup failed").toBeTruthy();
    const entry = await res.json();
    whitelistId = entry.id;
  });

  test.afterAll(async () => {
    if (whitelistId) {
      await ctx.delete(`/api/whitelist/${whitelistId}`);
    }
    await ctx.dispose();
  });

  test("returns 200 silently for a non-whitelisted sender", async ({
    request,
  }) => {
    const res = await request.post(
      webhookUrl(SECRET),
      webhookMultipart("unknown@example.com")
    );
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  test("returns 200 for a whitelisted sender", async ({ request }) => {
    const res = await request.post(
      webhookUrl(SECRET),
      webhookMultipart(WHITELISTED)
    );
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

// ── Transaction creation ──────────────────────────────────────────────────────

test.describe("Webhook — transaction creation", () => {
  const SENDER = "tx-webhook@example.com";
  const SECRET = process.env.WEBHOOK_SECRET!;
  let ctx: APIRequestContext;
  let whitelistId: string;

  test.beforeAll(async ({ playwright }) => {
    ctx = await playwright.request.newContext({ baseURL: BACKEND });
    await signInAsAdmin(ctx);

    const res = await ctx.post("/api/whitelist", {
      data: { senderEmail: SENDER },
    });
    expect(res.ok(), "Whitelist setup failed").toBeTruthy();
    const entry = await res.json();
    whitelistId = entry.id;
  });

  test.afterAll(async () => {
    if (whitelistId) {
      await ctx.delete(`/api/whitelist/${whitelistId}`);
    }
    await ctx.dispose();
  });

  test("creates a pending transaction for a whitelisted sender", async () => {
    const subject = "Dinner at restaurant";
    const body = "Paid 85 RON at Caru cu Bere";

    // Send the webhook
    const webhookRes = await ctx.post(webhookUrl(SECRET), {
      multipart: { from: SENDER, subject, text: body },
    });
    expect(webhookRes.status()).toBe(200);

    // Verify the transaction appears in the pending list
    const listRes = await ctx.get("/api/transactions");
    expect(listRes.ok()).toBeTruthy();
    const transactions: Array<{ id: string; rawEmailBody: string; status: string }> =
      await listRes.json();

    const created = transactions.find((tx) => tx.rawEmailBody === body);
    expect(created, "Transaction not found in pending list").toBeDefined();
    expect(created!.status).toBe("pending");

    // Clean up the transaction
    await ctx.delete(`/api/transactions/${created!.id}`);
  });

  test("uses the email body as rawEmailBody", async () => {
    const body = "Unique body for rawEmailBody test " + Date.now();

    await ctx.post(webhookUrl(SECRET), {
      multipart: { from: SENDER, subject: "Test", text: body },
    });

    const listRes = await ctx.get("/api/transactions");
    const transactions: Array<{ id: string; rawEmailBody: string }> =
      await listRes.json();

    const created = transactions.find((tx) => tx.rawEmailBody === body);
    expect(created, "Transaction with expected rawEmailBody not found").toBeDefined();

    await ctx.delete(`/api/transactions/${created!.id}`);
  });

  test("falls back to subject when body is empty", async () => {
    const subject = "Fallback subject " + Date.now();

    await ctx.post(webhookUrl(SECRET), {
      multipart: { from: SENDER, subject, text: "" },
    });

    // With DISABLE_AI=true the stub returns a fixed description,
    // but rawEmailBody should be the subject (effectiveBody = subject when text is empty)
    const listRes = await ctx.get("/api/transactions");
    const transactions: Array<{ id: string; rawEmailBody: string }> =
      await listRes.json();

    const created = transactions.find((tx) => tx.rawEmailBody === subject);
    expect(created, "Transaction using subject as body not found").toBeDefined();

    await ctx.delete(`/api/transactions/${created!.id}`);
  });
});
