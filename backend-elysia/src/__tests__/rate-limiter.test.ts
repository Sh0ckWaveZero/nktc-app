import { describe, it, expect, beforeEach } from "bun:test";
import { extractIp, createRateLimiter } from "@/middleware/rate-limiter";
import { TooManyRequestsError } from "@/libs/errors";

describe("extractIp", () => {
  it("returns first IP from comma-separated x-forwarded-for", () => {
    expect(extractIp({ "x-forwarded-for": "1.2.3.4, 5.6.7.8, 9.9.9.9" })).toBe("1.2.3.4");
  });

  it("trims whitespace from x-forwarded-for", () => {
    expect(extractIp({ "x-forwarded-for": "  1.2.3.4  " })).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when no x-forwarded-for", () => {
    expect(extractIp({ "x-real-ip": "9.9.9.9" })).toBe("9.9.9.9");
  });

  it("returns 'unknown' when no IP headers present", () => {
    expect(extractIp({})).toBe("unknown");
  });

  it("prefers x-forwarded-for over x-real-ip", () => {
    expect(extractIp({ "x-forwarded-for": "1.1.1.1", "x-real-ip": "2.2.2.2" })).toBe("1.1.1.1");
  });
});

describe("createRateLimiter", () => {
  let limiter: ReturnType<typeof createRateLimiter>;

  beforeEach(() => {
    // fresh limiter with unique keyPrefix to isolate state between tests
    limiter = createRateLimiter({ max: 3, windowMs: 60_000, keyPrefix: `test-${Math.random()}` });
  });

  describe("check", () => {
    it("allows requests under the limit", () => {
      expect(limiter.check("ip1").allowed).toBe(true);
      expect(limiter.check("ip1").allowed).toBe(true);
      expect(limiter.check("ip1").allowed).toBe(true);
    });

    it("blocks on the request exceeding max", () => {
      limiter.check("ip2");
      limiter.check("ip2");
      limiter.check("ip2");
      const result = limiter.check("ip2");
      expect(result.allowed).toBe(false);
    });

    it("includes retryAfter when blocked", () => {
      limiter.check("ip3");
      limiter.check("ip3");
      limiter.check("ip3");
      const result = limiter.check("ip3");
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it("tracks different keys independently", () => {
      limiter.check("ipA");
      limiter.check("ipA");
      limiter.check("ipA");
      limiter.check("ipA"); // blocked
      expect(limiter.check("ipB").allowed).toBe(true);
    });

    it("returns decreasing remaining count", () => {
      const r1 = limiter.check("ip4");
      const r2 = limiter.check("ip4");
      expect(r1.remaining).toBeGreaterThan(r2.remaining);
    });
  });

  describe("checkOrThrow", () => {
    it("does not throw when under the limit", () => {
      expect(() => limiter.checkOrThrow("ip5", "Too many")).not.toThrow();
    });

    it("throws TooManyRequestsError when limit exceeded", () => {
      limiter.check("ip6");
      limiter.check("ip6");
      limiter.check("ip6");
      expect(() => limiter.checkOrThrow("ip6", "Too many requests")).toThrow(TooManyRequestsError);
    });

    it("thrown error carries retryAfter", () => {
      limiter.check("ip7");
      limiter.check("ip7");
      limiter.check("ip7");
      try {
        limiter.checkOrThrow("ip7", "Too many");
        expect(true).toBe(false); // unreachable
      } catch (e) {
        expect(e).toBeInstanceOf(TooManyRequestsError);
        expect((e as TooManyRequestsError).retryAfter).toBeGreaterThan(0);
      }
    });

    it("thrown error message matches argument", () => {
      limiter.check("ip8");
      limiter.check("ip8");
      limiter.check("ip8");
      try {
        limiter.checkOrThrow("ip8", "Custom rate limit message");
      } catch (e) {
        expect((e as Error).message).toBe("Custom rate limit message");
      }
    });
  });

  describe("cleanup", () => {
    it("cleanup method exists and does not throw", () => {
      expect(() => limiter.cleanup()).not.toThrow();
    });
  });
});
