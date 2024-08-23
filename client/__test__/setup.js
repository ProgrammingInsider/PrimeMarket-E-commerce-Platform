import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

// Clear all mocks after each test
beforeEach(() => {
  vi.restoreAllMocks();
});
afterEach(() => {
  vi.clearAllMocks();
});
