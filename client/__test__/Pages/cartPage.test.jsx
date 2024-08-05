import {
  act,
  findByTestId,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, describe, beforeEach, vi } from "vitest";
import CartPage from "../../src/pages/CartPage";
import { BrowserRouter } from "react-router-dom";
import ContextAPI from "../../src/context/ContextAPI";
import useAxiosPrivate from "../../src/hooks/useAxiosPrivate";
import { cartItems } from "../SampleDatas/cartItems";

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
        <CartPage />
      </ContextAPI>
    </BrowserRouter>,
  );
};

const cartCalculation = (results) => {
  const newSubTotal = results.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  const taxRate = 0.1;
  const taxAmount = newSubTotal * taxRate;
  const shippingCost = 5;
  const newTotal = newSubTotal + taxAmount + shippingCost;

  expect(screen.getByText(/sub/i)).toBeInTheDocument();
  expect(screen.getByText(`$${newSubTotal.toFixed(2)}`)).toBeInTheDocument();
  expect(screen.getByText(/tax/i)).toBeInTheDocument();
  expect(screen.getByText(`$${taxAmount.toFixed(2)}`)).toBeInTheDocument();
  expect(screen.getByText(/shipping/i)).toBeInTheDocument();
  expect(screen.getByText(`$5.00`)).toBeInTheDocument();
  expect(screen.getByText("Total:")).toBeInTheDocument();
  expect(screen.getByText(`$${newTotal.toFixed(2)}`)).toBeInTheDocument();
};

describe("Cart Page", () => {
  let results;
  beforeEach(() => {
    results = cartItems.result;
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: cartItems }),
      delete: vi.fn().mockResolvedValue({ data: { message: "Item removed" } }),
      put: vi.fn().mockResolvedValue(),
    }));
  });

  it("All elements should render properly", async () => {
    renderComponent();

    for (const item of cartItems.result) {
      const { product } = item;

      await waitFor(() => {
        expect(
          screen.getByText(`${cartItems.result.length} items in the cart`),
        ).toBeInTheDocument();
        expect(screen.getByAltText(product.name)).toBeInTheDocument();
        const inStock = screen.getAllByText(/in stock/i);

        inStock.forEach((amount) => {
          expect(amount).toBeInTheDocument();
        });
        expect(screen.getByText(product.name)).toBeInTheDocument();
        expect(
          screen.getByText(`(${product.ratingCount} reviews)`),
        ).toBeInTheDocument();
        expect(screen.getByText(`$${product.price}`)).toBeInTheDocument();

        const removeBtn = screen.getAllByText(/remove/i);

        removeBtn.forEach((btn) => {
          expect(btn).toBeInTheDocument();
        });

        expect(screen.getByLabelText(`quantity-${product._id}`)).toHaveValue(
          item.quantity,
        );
      });
    }

    await waitFor(() => {
      cartCalculation(results);
    });
  });

  it("should display In stock and out of stock words when stock amout morethan one and lessthan 1", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({
        data: {
          ...cartItems,
          result: cartItems.result.map((item) => ({
            ...item,
            product: {
              ...item.product,
              stock: 0,
            },
          })),
        },
      }),
      delete: vi.fn().mockResolvedValue({ data: { message: "Item removed" } }),
      put: vi.fn().mockResolvedValue(),
    }));

    renderComponent();
    const outOfStock = await screen.findAllByText(/out of stock/i);
    const inStock = screen.queryAllByText(/in stock/i);

    outOfStock.forEach((item) => {
      expect(item).toBeInTheDocument();
    });

    inStock.forEach((item) => {
      expect(item).not.toBeInTheDocument();
    });
  });

  it("Should increase and decrease quantity when the user click on minus and plus", async () => {
    const user = userEvent.setup();

    renderComponent();

    for (const item of cartItems.result) {
      const { product } = item;
      const currentQty = item.quantity;
      await user.click(await screen.findByTestId(`plus${product._id}`));
      expect(
        await screen.findByLabelText(`quantity-${product._id}`),
      ).toHaveValue(currentQty + 1);
      const increasedQty = currentQty + 1;
      await user.click(await screen.findByTestId(`minus${product._id}`));
      expect(
        await screen.findByLabelText(`quantity-${product._id}`),
      ).toHaveValue(increasedQty - 1);
    }
  });

  it("Should throw an error when quantity is failed", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: cartItems }),
      delete: vi.fn().mockResolvedValue({ data: { message: "Item deleted" } }),
      put: vi.fn().mockRejectedValueOnce({
        response: { data: { message: "something went wrong" } },
      }),
    }));

    const user = userEvent.setup();

    renderComponent();

    for (const item of cartItems.result) {
      const { product } = item;
      await user.click(await screen.findByTestId(`plus${product._id}`));
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "error",
        "something went wrong",
      );
      await user.click(await screen.findByTestId(`minus${product._id}`));
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "error",
        "something went wrong",
      );
    }
  });

  it("should remove items when user clicks on remove item button", async () => {
    const user = userEvent.setup();

    renderComponent();

    for (const result of results) {
      const { product } = result;
      await user.click(await screen.findByTestId(`removeBtn${product._id}`));
      await waitFor(() => {
        expect(showDialogBox).toHaveBeenCalledWith(
          true,
          "success",
          "Item removed",
        );
      });
    }
  });

  it("should throw an error when removing item is failed", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: cartItems }),
      delete: vi.fn().mockRejectedValueOnce({
        response: { data: { message: "Something went wrong" } },
      }),
      put: vi.fn().mockResolvedValue(),
    }));
    const user = userEvent.setup();

    renderComponent();

    for (const result of results) {
      const { product } = result;
      await user.click(await screen.findByTestId(`removeBtn${product._id}`));
      await waitFor(() => {
        expect(showDialogBox).toHaveBeenCalledWith(
          true,
          "error",
          "Something went wrong",
        );
      });
    }
  });
});
