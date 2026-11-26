import { describe, expect, it } from "vitest";
import { formatDateKey, getLocalDateKey } from "@/lib/dateUtils";

describe("dateUtils", () => {
  it("creates a local date key without shifting the calendar day", () => {
    expect(getLocalDateKey(new Date(2025, 0, 9, 23, 30))).toBe("2025-01-09");
  });

  it("formats an ISO date key for display without timezone conversion", () => {
    expect(formatDateKey("2025-01-09")).toBe("09/01/2025");
  });
});
