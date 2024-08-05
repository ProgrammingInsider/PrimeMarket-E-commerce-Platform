import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { it, expect, describe, vi, beforeEach } from "vitest";
import ContextAPI from "../../src/context/ContextAPI";
import useAxiosPrivate from "../../src/hooks/useAxiosPrivate";
import ProductDetailPage from "../../src/pages/ProductDetailPage";
import { productDetail } from "../SampleDatas/productDetailResponse";
import { getRate } from "../../src/services/cartServices";
import { ratingResponse } from "../SampleDatas/ratingResponse";
import useAddToCart from "../../src/hooks/useAddToCart";

vi.mock("../../src/services/cartServices");

const mockAddToCart = vi.fn();
vi.mock("../../src/hooks/useAddToCart");

const showDialogBox = vi.hoisted(() => vi.fn());
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
      showDialogBox,
    })),
  };
});

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    useParams: vi.fn(() => ({ productid: "667c852933acad2623688b9a" })),
  };
});

vi.mock("../../src/hooks/useAxiosPrivate", () => ({
  __esModule: true,
  default: vi.fn(),
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ContextAPI>
        <ProductDetailPage />
      </ContextAPI>
    </BrowserRouter>,
  );
};

describe("Product Detail Page", () => {
  beforeEach(() => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: productDetail }),
      post: vi.fn().mockResolvedValue({
        data: {
          message: "Rate product 5 out of 5",
          user: { _id: "667c852933acad26236445c8" },
        },
      }),
    }));

    vi.mocked(getRate).mockResolvedValue(ratingResponse);

    useAddToCart.mockReturnValue(mockAddToCart);
  });

  it("All elements should render properly", async () => {
    renderComponent();

    // Wait For Product Detail Elements
    await waitFor(() => {
      expect(screen.getByAltText(/product/i)).toBeInTheDocument();
      expect(screen.getByText(productDetail.result.name)).toBeInTheDocument();
      expect(
        screen.getByText(`Price $${productDetail.result.price}`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `${productDetail.result.description.slice(0, 250)}...`,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText(/see more/i)).toBeInTheDocument();
      expect(screen.getByText(/cart/i)).toBeInTheDocument();
      expect(screen.getByText(productDetail.result.brand)).toBeInTheDocument();
      expect(
        screen.getByText(`${productDetail.result.weight} kg`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${productDetail.result.dimensions} cm`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(`${productDetail.result.stock} available`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `posted ${productDetail.result.createdAt.split("T")[0]}`,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `posted ${productDetail.result.createdAt.split("T")[0]}`,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(productDetail.result.firstname),
      ).toBeInTheDocument();
      expect(
        screen.getByText(productDetail.result.lastname),
      ).toBeInTheDocument();
      expect(
        screen.getByAltText(`${productDetail.result.firstname} User Image`),
      ).toBeInTheDocument();
    });

    // Wait For Product Rate Elements
    await waitFor(() => {
      [1, 2, 3, 4, 5].forEach((star) => {
        expect(screen.getByText(star)).toBeInTheDocument();
        expect(screen.getByTitle(`Rate product ${star}/5`)).toBeInTheDocument();
      });
      expect(
        screen.getByText(productDetail.result.averageRating),
      ).toBeInTheDocument();
      const reviews = screen.getAllByText(/reviews/i);
      reviews.forEach((review) => {
        expect(review).toBeInTheDocument();
      });
      expect(screen.getByText("Rating and reviews")).toBeInTheDocument();
      expect(screen.getByText("Rate Product Here:")).toBeInTheDocument();
      for (const rate of ratingResponse.result) {
        expect(screen.getByText(rate.user.firstname)).toBeInTheDocument();
        expect(screen.getByText(rate.user.lastname)).toBeInTheDocument();
        expect(screen.getByText(rate.comment)).toBeInTheDocument();
        expect(
          screen.getByText(rate.updatedAt.split("T")[0]),
        ).toBeInTheDocument();
      }
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /submit/i }),
      ).not.toBeInTheDocument();
    });
  });

  it("should call addToCart when the add to cart button clicked", async () => {
    const user = userEvent.setup();

    renderComponent();
    await user.click(await screen.findByText("Add to Cart"));
    expect(mockAddToCart).toHaveBeenCalledWith("667c852933acad2623688b9a");
  });

  it("should show full description when see more button clicked", async () => {
    const user = userEvent.setup();

    renderComponent();
    await user.click(await screen.findByText(/see more/i));

    await waitFor(() => {
      expect(
        screen.getByText(productDetail.result.description),
      ).toBeInTheDocument();
      expect(screen.getByText(/Show less/i)).toBeInTheDocument();
    });
  });

  it("should display out of stcok text when the stock amount is less tahn 1", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({
        data: { result: { ...productDetail.result, stock: 0 } },
      }),
    }));

    renderComponent();

    expect(await screen.findByText("Out of stock")).toBeInTheDocument();
  });

  it("User should able to rate product and give comment", async () => {
    const user = userEvent.setup();

    renderComponent();
    await user.click(await screen.findByTitle("Rate product 5/5"));
    user.type(await screen.findByRole("textbox"), "A nice product");
    await user.click(await screen.findByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "success",
        "Rate product 5 out of 5",
      );
    });
  });
});
