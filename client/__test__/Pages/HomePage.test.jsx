import { render, screen, waitFor } from "@testing-library/react";
import { it, expect, describe, beforeEach, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ContextAPI from "../../src/context/ContextAPI";
import HomePage from "../../src/pages/HomePage";
import { getCategories } from "../../src/services/get";
import { categories } from "../SampleDatas/categories";
import useProducts from "../../src/hooks/useProducts";
import { relatedProducts } from "../SampleDatas/relatedProducts";
import userEvent from "@testing-library/user-event";

vi.mock("../../src/services/get");

vi.mock("../../src/hooks/useProducts", () => ({
  __esModule: true,
  default: vi.fn(),
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ContextAPI>
        <HomePage />
      </ContextAPI>
    </BrowserRouter>,
  );
};

describe("Home Page", () => {
  let mainCategory;
  let subCategory;

  beforeEach(() => {
    vi.mocked(getCategories).mockResolvedValue(categories);

    mainCategory = categories.results.filter(
      (category) => category.parent_category === null,
    );
    subCategory = categories.results.filter(
      (category) => category.parent_category !== null,
    );
  });

  it("should render all elements properly", async () => {
    const mockRelatedProducts = vi.fn().mockResolvedValue(relatedProducts);
    vi.mocked(useProducts).mockReturnValue(mockRelatedProducts);

    renderComponent();

    for (const category of mainCategory) {
      expect(
        await screen.findByText(category.category_name),
      ).toBeInTheDocument();
    }

    for (const sub of subCategory) {
      expect(screen.queryByText(sub.category_name)).not.toBeInTheDocument();
    }

    for (const product of relatedProducts.filteredProducts) {
      expect(await screen.findByText(product.name)).toBeInTheDocument();
      expect(await screen.findByText(`$${product.price}`)).toBeInTheDocument();
      expect(
        await screen.findByText(product.description.slice(0, 90)),
      ).toBeInTheDocument();
    }

    expect(
      await screen.findByText(
        `${relatedProducts.filteredProducts.length} results`,
      ),
    ).toBeInTheDocument();
  });

  it("should show sub category and filter indicator when user filters products", async () => {
    const mockRelatedProducts = vi.fn().mockResolvedValue(relatedProducts);
    vi.mocked(useProducts).mockReturnValue(mockRelatedProducts);

    const user = userEvent.setup();

    renderComponent();

    await user.click(await screen.findByText(/electronics/i));

    // Category and subcategory filters
    const electronicsData = mainCategory.find(
      (category) => category.slug === "electronics",
    );

    for (const category of categories.results) {
      if (
        category.parent_category === electronicsData._id ||
        category.parent_category === null
      ) {
        if (category.category_name === electronicsData.category_name) {
          const electronics = await screen.findAllByText(
            category.category_name,
          );
          electronics.forEach((item) => {
            expect(item).toBeInTheDocument();
          });
        } else {
          expect(
            await screen.findByText(category.category_name),
          ).toBeInTheDocument();
        }
      } else {
        expect(
          screen.queryByText(category.category_name),
        ).not.toBeInTheDocument();
      }
    }

    // Filter by rating
    for (const rate of [5, 4, 3, 2, 1]) {
      await user.click(await screen.findByTitle(`Filter by ${rate} rate`));

      await waitFor(() => {
        expect(screen.getByText(`${rate} star`)).toBeInTheDocument();
      });
    }

    await user.type(await screen.findByLabelText(/lower/i), "100");
    await user.type(await screen.findByLabelText(/higher/i), "1000");
    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("1000")).toBeInTheDocument();
    });

    await user.click(await screen.findByText(/clear/i));

    expect(screen.queryByText("100")).not.toBeInTheDocument();
    expect(screen.queryByText("1000")).not.toBeInTheDocument();
    expect(screen.queryByText(/star/i)).not.toBeInTheDocument();

    for (const category of categories.results) {
      if (category.parent_category === null) {
        expect(
          await screen.findByText(category.category_name),
        ).toBeInTheDocument();
      } else {
        expect(
          screen.queryByText(category.category_name),
        ).not.toBeInTheDocument();
      }
    }
  });

  it('should display "No related products" when products not available as per the filter', async () => {
    const mockNoProducts = vi.fn().mockResolvedValue({
      filteredProducts: [],
      message: "No Related Products",
    });
    vi.mocked(useProducts).mockReturnValue(mockNoProducts);

    renderComponent();

    expect(await screen.findByText(/no related products/i)).toBeInTheDocument();
  });

  it("When categories not fetched properly it should logged error message", async () => {
    const mockRelatedProducts = vi.fn().mockResolvedValue(relatedProducts);
    vi.mocked(useProducts).mockReturnValue(mockRelatedProducts);
    vi.mocked(getCategories).mockRejectedValueOnce();

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderComponent();

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        "something went wrong, please try again",
      );
    });
  });
});
