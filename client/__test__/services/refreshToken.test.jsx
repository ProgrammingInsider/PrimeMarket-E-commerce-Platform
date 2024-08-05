import { it, expect, describe, vi } from "vitest";
import { refreshToken } from "../../src/services/authServices";
import { axiosPrivate } from "../../src/services/axios";

vi.mock("../../src/services/axios");

const mockResponse = {
  userId: "667c852933acad2623688b9a",
  firstname: "Amanuel",
  lastname: "Abera",
  accessToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjdjODUyOTMzYWNhZDI2MjM2ODhiOWEiLCJmaXJzdG5hbWUiOiJBbWFudWVsIiwibGFzdG5hbWUiOiJBYmVyYSIsImlhdCI6MTcyMDg2ODg0OCwiZXhwIjoxNzIwOTU1MjQ4fQ.DgNIXWJ72NmWt2x5mUsT6PdkQEwR711cvSijbanT9N8",
};

describe("Refresh Token Services", () => {
  it("should return 200 status code when refresh token generated", async () => {
    axiosPrivate.get.mockResolvedValue({
      data: mockResponse,
    });
    const result = await refreshToken();

    expect(axiosPrivate.get).toHaveBeenCalledWith("/refreshtoken");

    expect(result).toEqual({
      ...mockResponse,
      statusCode: 200,
    });
  });

  it("should return 500 when user registeration fialed", async () => {
    axiosPrivate.get.mockRejectedValue({
      data: { message: "Something went wrong. Try again later.", status: true },
    });
    const result = await refreshToken();

    expect(result).toEqual({
      message: "Something went wrong. Try again later.",
      statusCode: 500,
    });
  });

  it("should return 500 when user registeration is fialed and no message response", async () => {
    axiosPrivate.get.mockRejectedValue({
      data: { response: "" },
    });
    const result = await refreshToken();

    expect(result).toEqual({
      message: "Something went wrong. Try again later.",
      statusCode: 500,
    });
  });
});
