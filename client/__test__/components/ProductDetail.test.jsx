import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { it, expect, describe, vi } from "vitest";
import ContextAPI from "../../src/context/ContextAPI";
import ProductDetail from "../../src/components/common/ProductDetail";
import { productDetail } from "../SampleDatas/productDetailResponse";
import useAxiosPrivate from "../../src/hooks/useAxiosPrivate";

// Mocking the necessary functions and hooks
const setMessage = vi.fn();
const setProduct = vi.fn();
const setCategory = vi.fn();
const setRatingCount = vi.fn();
const setAverageRating = vi.fn();

vi.mock("../../src/hooks/useAxiosPrivate", async () => ({
  _esModule: true,
  default: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({ data: productDetail }),
  })),
}));

const renderComponent = (productid, product, message) => {
  return render(
    <BrowserRouter>
      <ContextAPI>
        <ProductDetail
          productid={productid}
          product={product}
          message={message}
          setMessage={setMessage}
          setCategory={setCategory}
          setProduct={setProduct}
          setRatingCount={setRatingCount}
          setAverageRating={setAverageRating}
        />
      </ContextAPI>
    </BrowserRouter>,
  );
};

describe("Product Detail Component", () => {
  let product;
  beforeEach(() => {
    product = productDetail.result;
  });

  it("should render all elements properly", async () => {
    renderComponent("668befa2cd23d557285039ef", product, "");

    await waitFor(() => {
      expect(screen.getByAltText("Product Image")).toBeInTheDocument();
      expect(
        screen.getByText(`posted ${product.createdAt.split("T")[0]}`),
      ).toBeInTheDocument();
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(`Price $${product.price}`)).toBeInTheDocument();
      expect(
        screen.getByText(`${product.description.slice(0, 250)}...`),
      ).toBeInTheDocument();
      // expect(screen.getByRole('button', { name: /cart/i })).toBeInTheDocument();
      expect(screen.getByText(product.brand)).toBeInTheDocument();
      expect(
        screen.getByText(`${product.stock} available`),
      ).toBeInTheDocument();
      expect(screen.getByText(`${product.weight} kg`)).toBeInTheDocument();
      expect(screen.getByText(`${product.dimensions} cm`)).toBeInTheDocument();
      expect(
        screen.getByAltText(`${product.firstname} User Image`),
      ).toBeInTheDocument();
      expect(screen.getByText(product.firstname)).toBeInTheDocument();
      expect(screen.getByText(product.lastname)).toBeInTheDocument();
      expect(
        screen.getByText(`(${product.ratingCount} reviews)`),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(setProduct).toHaveBeenCalledWith(product);
      expect(setCategory).toHaveBeenCalledWith(product.category);
      expect(setRatingCount).toHaveBeenCalledWith(product.ratingCount);
      expect(setAverageRating).toHaveBeenCalledWith(product.averageRating);
    });
  });

  it("should display full description when 'See More' button is clicked", async () => {
    const userClick = userEvent.setup();
    renderComponent("668befa2cd23d557285039ef", product, "");
    await userClick.click(await screen.findByRole("button", { name: /more/i }));
    expect(screen.getByText(product.description)).toBeInTheDocument();
  });

  it("should collapse description to 250 characters when 'Show Less' button is clicked", async () => {
    const userClick = userEvent.setup();
    renderComponent("668befa2cd23d557285039ef", product, "");
    await userClick.click(await screen.findByRole("button", { name: /more/i }));
    await userClick.click(await screen.findByRole("button", { name: /less/i }));
    expect(
      screen.getByText(`${product.description.slice(0, 250)}...`),
    ).toBeInTheDocument();
  });

  it("should display out of stock text when stock value is less than 1", async () => {
    renderComponent("668befa2cd23d557285039ef", { ...product, stock: 0 }, "");
    expect(await screen.findByText(/Out of stock/i)).toBeInTheDocument();
  });

  it("should display the first character of firstname and lastname when profilePic is null", async () => {
    renderComponent(
      "668befa2cd23d557285039ef",
      { ...product, profilePic: null },
      "",
    );
    expect(
      await screen.findByText(`${product.firstname[0]}${product.lastname[0]}`),
    ).toBeInTheDocument();
  });

  it("should display bad request error message when product is not found", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockRejectedValueOnce({
        response: { status: 400, data: { message: "Product Not Found" } },
      }),
    }));

    renderComponent("668befa2cd23d557285039ef", {}, "Product Not Found");

    await waitFor(() => {
      expect(screen.queryByAltText("Product Image")).not.toBeInTheDocument();
      expect(
        screen.queryByText(`posted ${product.createdAt.split("T")[0]}`),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(product.name)).not.toBeInTheDocument();
      expect(
        screen.queryByText(`Price $${product.price}`),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(`${product.description.slice(0, 250)}...`),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /cart/i }),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(product.brand)).not.toBeInTheDocument();
      expect(
        screen.queryByText(`${product.stock} available`),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(`${product.weight} kg`),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(`${product.dimensions} cm`),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByAltText(`${product.firstname} User Image`),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(product.firstname)).not.toBeInTheDocument();
      expect(screen.queryByText(product.lastname)).not.toBeInTheDocument();
      expect(
        screen.queryByText(`(${product.ratingCount} reviews)`),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      const notFound = screen.getAllByText(/Product Not Found/i);
      notFound.forEach((item) => expect(item).toBeInTheDocument());
      expect(setMessage).toHaveBeenCalledWith("Product Not Found");
      expect(setProduct).not.toHaveBeenCalled();
      expect(setCategory).not.toHaveBeenCalled();
      expect(setRatingCount).not.toHaveBeenCalled();
      expect(setAverageRating).not.toHaveBeenCalled();
    });
  });

  it("should display internal server error message when something went wrong", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockRejectedValueOnce({
        response: {
          status: 500,
          data: { message: "Something went wrong, please try later" },
        },
      }),
    }));

    renderComponent(
      "668befa2cd23d557285039ef",
      {},
      "Something went wrong, please try later",
    );

    await waitFor(() => {
      expect(
        screen.getByText("Something went wrong, please try later"),
      ).toBeInTheDocument();
      expect(setMessage).toHaveBeenCalledWith(
        "Something went wrong, please try later",
      );
    });
  });
});
