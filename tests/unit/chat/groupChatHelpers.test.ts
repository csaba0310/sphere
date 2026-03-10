import { describe, it, expect } from "vitest";
import {
  PINNED_GROUP_IDS,
  isPinnedGroup,
} from "../../../src/components/chat/utils/groupChatHelpers";

describe("PINNED_GROUP_IDS", () => {
  it("should include announcements and general", () => {
    expect(PINNED_GROUP_IDS).toContain("announcements");
    expect(PINNED_GROUP_IDS).toContain("general");
  });
});

describe("isPinnedGroup", () => {
  it("should return true for pinned group IDs", () => {
    for (const id of PINNED_GROUP_IDS) {
      expect(isPinnedGroup(id)).toBe(true);
    }
  });

  it("should return false for non-pinned group IDs", () => {
    expect(isPinnedGroup("random-group")).toBe(false);
    expect(isPinnedGroup("")).toBe(false);
  });
});
