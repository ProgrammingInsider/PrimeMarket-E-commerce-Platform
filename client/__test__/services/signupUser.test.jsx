import { it, expect, describe, vi, beforeEach } from "vitest";
import { signupUser } from "../../src/services/authServices";
import { axiosPrivate } from "../../src/services/axios";

vi.mock("../../src/services/axios");

const credentials = {
  firstname: "Amanuel",
  lastname: "Abera",
  email: "amanuelabera46@gmail.com",
  password: "aman123",
};

describe("Signup User Services", () => {
  it("should return 200 status code when user signed in successfully", async () => {
    axiosPrivate.post.mockResolvedValue({
      data: { message: "user register successfully", status: true },
    });
    const result = await signupUser(credentials);

    expect(axiosPrivate.post).toHaveBeenCalledWith("/signup", {
      ...credentials,
    });

    expect(result).toEqual({
      message: "user register successfully",
      status: true,
      statusCode: 200,
    });
  });

  it("should return 500 when user registeration fialed", async () => {
    axiosPrivate.post.mockRejectedValue({
      data: {
        response: {
          message: "Something went wrong. Try again later.",
          status: true,
        },
      },
    });
    const result = await signupUser(credentials);

    expect(result).toEqual({
      message: "Something went wrong. Try again later.",
      statusCode: 500,
    });
  });

  it("should return 500 when user registeration is fialed and no message response", async () => {
    axiosPrivate.post.mockRejectedValue({
      data: { response: "" },
    });
    const result = await signupUser(credentials);

    expect(result).toEqual({
      message: "Something went wrong. Try again later.",
      statusCode: 500,
    });
  });
});
