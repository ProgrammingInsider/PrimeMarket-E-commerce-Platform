import { it, expect, describe, vi, beforeEach } from "vitest";
import { signinUser } from "../../src/services/authServices";
import { axiosPrivate } from "../../src/services/axios";

vi.mock("../../src/services/axios");

const credentials = {
  email: "amanuelabera46@gmail.com",
  password: "aman123",
};

describe("Sign In User Services", () => {
  it("should return 200 status code when user signed in successfully", async () => {
    axiosPrivate.post.mockResolvedValue({
      data: { message: "user Logged in successfully", status: true },
    });
    const result = await signinUser(credentials);

    expect(axiosPrivate.post).toHaveBeenCalledWith("/signin", {
      ...credentials,
    });

    expect(result).toEqual({
      message: "user Logged in successfully",
      status: true,
      statusCode: 200,
    });
  });

  it("should return 500 when user login fialed", async () => {
    axiosPrivate.post.mockRejectedValue({
      data: { message: "Something went wrong. Try again later.", status: true },
    });
    const result = await signinUser(credentials);

    expect(result).toEqual({
      message: "Something went wrong. Try again later.",
      statusCode: 500,
    });
  });

  it("should return 500 when user login is fialed and no message response", async () => {
    axiosPrivate.post.mockRejectedValue({
      data: { response: "" },
    });
    const result = await signinUser(credentials);

    expect(result).toEqual({
      message: "Something went wrong. Try again later.",
      statusCode: 500,
    });
  });
});
