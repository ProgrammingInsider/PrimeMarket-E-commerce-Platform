import { render, screen, waitFor } from "@testing-library/react";
import { it, expect, describe, vi } from "vitest";
import PersistLogin from "../../src/routes/PersistLogin";
import { BrowserRouter } from "react-router-dom";
import ContextAPI, { useGlobalContext } from "../../src/context/ContextAPI";
import useRefreshToken from "../../src/hooks/useRefreshToken";

vi.mock("../../src/context/ContextAPI", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    useGlobalContext: vi.fn(() => ({
      auth: {
        userId: "667c852933acad2623688b9a",
        firstname: "Amanuel",
        lastname: "Abera",
        accessToken:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjdjODUyOTMzYWNhZDI2MjM2ODhiOWEiLCJmaXJzdG5hbWUiOiJBbWFudWVsIiwibGFzdG5hbWUiOiJBYmVyYSIsImlhdCI6MTcyMDg2ODg0OCwiZXhwIjoxNzIwOTU1MjQ4fQ.DgNIXWJ72NmWt2x5mUsT6PdkQEwR711cvSijbanT9N8",
      },
    })),
  };
});
vi.mock("../../src/hooks/useRefreshToken");

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ContextAPI>
        <PersistLogin />
      </ContextAPI>
    </BrowserRouter>,
  );
};

describe("Persist Login Component", () => {
  it("should not generate token until pervious generated token exist", async () => {
    const mockRefresh = vi.fn().mockResolvedValue();
    vi.mocked(useRefreshToken).mockReturnValue(mockRefresh);

    renderComponent();

    expect(mockRefresh).not.toHaveBeenCalledOnce();
  });

  it("should generate new token if is not genarated previous", async () => {
    const mockRefresh = vi.fn().mockResolvedValue();
    vi.mocked(useRefreshToken).mockReturnValue(mockRefresh);
    vi.mocked(useGlobalContext).mockImplementation(() => ({ accessToken: "" }));

    renderComponent();

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledOnce();
    });
  });

  it("should console log the error when refresh token failed", async () => {
    const mockRefresh = vi
      .fn()
      .mockRejectedValueOnce(new Error("refresh failed"));
    vi.mocked(useRefreshToken).mockReturnValue(mockRefresh);
    vi.mocked(useGlobalContext).mockImplementation(() => ({ accessToken: "" }));

    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderComponent();

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: "refresh failed" }),
      );
    });
  });

  it("should console log the error when refresh token failed", async () => {
    const mockRefresh = vi
      .fn()
      .mockRejectedValueOnce(new Error("refresh failed"));
    vi.mocked(useRefreshToken).mockReturnValue(mockRefresh);
    vi.mocked(useGlobalContext).mockImplementation(() => ({ accessToken: "" }));

    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderComponent();

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({ message: "refresh failed" }),
      );
    });
  });
});
