import { it, expect, describe, vi } from "vitest";
import { axiosPrivate } from "../../src/services/axios";
import { getRate } from "../../src/services/cartServices";
import { ratingResponse } from "../SampleDatas/ratingResponse";

vi.mock("../../src/services/axios");

describe("Cart Services", () => {
  it("should return 200 status code when fetch rating", async () => {
    axiosPrivate.get.mockResolvedValue({
      data: ratingResponse,
    });
    const result = await getRate("667c852933acad2623688b9a");

    expect(axiosPrivate.get).toHaveBeenCalledWith(
      "/getrate/667c852933acad2623688b9a",
    );

    expect(result).toEqual({
      ...ratingResponse,
      statusCode: 200,
    });
  });

  it("should return 500 when fetch rating fialed", async () => {
    axiosPrivate.get.mockRejectedValue({
      data: { message: "Something went wrong. Try again later.", status: true },
    });
    const result = await getRate("667c852933acad2623688b9a");

    expect(result).toEqual({
      message: "Something went wrong. Try again later.",
      statusCode: 500,
    });
  });

  it("should return 500 when fetch rating is fialed and no message response", async () => {
    axiosPrivate.get.mockRejectedValue({
      data: { response: "" },
    });
    const result = await getRate("667c852933acad2623688b9a");

    expect(result).toEqual({
      message: "Something went wrong. Try again later.",
      statusCode: 500,
    });
  });
});
