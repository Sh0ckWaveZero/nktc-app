import { describe, expect, it } from "bun:test";
import { getBangkokDayRange, toStoredCheckInDate } from "@/libs/date";

describe("Bangkok check-in dates", () => {
	it("builds a Bangkok day range from a date-only string", () => {
		const { start, end } = getBangkokDayRange("2026-05-29");

		expect(start.toISOString()).toBe("2026-05-28T17:00:00.000Z");
		expect(end.toISOString()).toBe("2026-05-29T16:59:59.999Z");
	});

	it("treats an ISO value from a Bangkok midnight Date as the intended local date", () => {
		const { start, end } = getBangkokDayRange("2026-05-28T17:00:00.000Z");

		expect(start.toISOString()).toBe("2026-05-28T17:00:00.000Z");
		expect(end.toISOString()).toBe("2026-05-29T16:59:59.999Z");
	});

	it("normalizes stored check-in dates to UTC midnight for the Bangkok date", () => {
		expect(toStoredCheckInDate("2026-05-28T17:00:00.000Z").toISOString()).toBe("2026-05-29T00:00:00.000Z");
	});
});
