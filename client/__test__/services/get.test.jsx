import { it, expect, describe, vi } from "vitest";
import { axiosPrivate } from "../../src/services/axios";
import { getCategories } from "../../src/services/get";
import { categories } from "../SampleDatas/categories";

vi.mock("../../src/services/axios");

describe("Get Categories Services", () => {
  it("should return 200 status code when fetch categories", async () => {
    axiosPrivate.get.mockResolvedValue({
      data: categories,
    });
    const result = await getCategories();

    expect(axiosPrivate.get).toHaveBeenCalledWith("/productcategory");

    expect(result).toEqual({
      ...categories,
      statusCode: 200,
    });
  });

  it("should return 500 when ftech categories fialed", async () => {
    axiosPrivate.get.mockRejectedValue({
      data: { message: "Something went wrong. Try again later.", status: true },
    });
    const result = await getCategories();

    expect(result).toEqual({
      message: "Something went wrong. Try again later.",
      statusCode: 500,
    });
  });

  it("should return 500 when fetch categories is fialed and no message response", async () => {
    axiosPrivate.get.mockRejectedValue({
      data: { response: "" },
    });
    const result = await getCategories();

    expect(result).toEqual({
      message: "Something went wrong. Try again later.",
      statusCode: 500,
    });
  });
});
