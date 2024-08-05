import { it, expect, describe, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import UserPage from "../../src/pages/UserPage";
import { BrowserRouter, useParams } from "react-router-dom";
import ContextAPI, { useGlobalContext } from "../../src/context/ContextAPI";
import useAxiosPrivate from "../../src/hooks/useAxiosPrivate";
import userEvent from "@testing-library/user-event";
import { response } from "../SampleDatas/userInfoResponse";

const showDialogBox = vi.fn();

vi.mock("../../src/context/ContextAPI", () => ({
  __esModule: true,
  default: vi.fn(({ children }) => children),
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
}));

vi.mock("../../src/hooks/useAxiosPrivate", () => ({
  __esModule: true,
  default: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({ data: response }),
    delete: vi
      .fn()
      .mockResolvedValue({ data: { message: "Product deleted successfully" } }),
  })),
}));

// Mock ContextAPI
// Define showDialogBox function

vi.mock("react-router-dom", () => ({
  __esModule: true,
  useParams: vi.fn(() => ({
    profileid: "667c852933acad2623688b9a",
  })),
  BrowserRouter: vi.fn(({ children }) => children),
  Link: vi.fn(({ children }) => children),
}));

const renderComponent = (component) => {
  return render(
    <BrowserRouter>
      <ContextAPI>{component}</ContextAPI>
    </BrowserRouter>,
  );
};

const productElements = async (products) => {
  for (const product of products) {
    expect(await screen.findByText(product.name)).toBeInTheDocument();
    expect(await screen.findByAltText(product.name)).toBeInTheDocument();
    expect(
      await screen.findByText(product.description.substring(0, 90)),
    ).toBeInTheDocument();
    expect(await screen.findByText(`$${product.price}`)).toBeInTheDocument();
    expect(
      await screen.findByText(`(${product.ratingCount} reviews)`),
    ).toBeInTheDocument();
  }
  expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
};

const staticUserElements = async (userInfo) => {
  expect(await screen.findByText(userInfo.address.city)).toBeInTheDocument();
  expect(await screen.findByText(userInfo.address.country)).toBeInTheDocument();
  expect(await screen.findByText(`Id: ${userInfo._id}`)).toBeInTheDocument();
  expect(await screen.findByText(userInfo.firstname)).toBeInTheDocument();
  expect(await screen.findByText(userInfo.lastname)).toBeInTheDocument();
};

describe("User Page", () => {
  let user;
  let products = response.products;
  let productQuantity = response.productQuantity;

  beforeEach(async () => {
    user = response.user;
  });

  it("All Components elements should be rendered properly", async () => {
    renderComponent(<UserPage />);
    await staticUserElements(user);
    expect(await screen.findByAltText("Banner")).toBeInTheDocument();
    expect(await screen.findByAltText("Profile Pic")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /create/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /edit/i }),
    ).toBeInTheDocument();
    await productElements(products);
    for (const product of products) {
      expect(
        await screen.findByTestId(`threedot${product._id}`),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId(`cartIcon${product._id}`),
      ).not.toBeInTheDocument();
    }
    expect(
      await screen.findByText(`Products (${productQuantity})`),
    ).toBeInTheDocument();
    expect(screen.getByTestId("profilePicadminicons")).toBeInTheDocument();
    expect(screen.getByTestId("banneradminicons")).toBeInTheDocument();
  });

  it("Elements should be hidden when corresponding property value is null", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({
        data: {
          ...response,
          user: { ...response.user, bannerPic: null, profilePic: null },
        },
      }),
    }));
    renderComponent(<UserPage />);

    await staticUserElements(user);
    expect(screen.queryByAltText("Banner")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Profile Pic")).not.toBeInTheDocument();
    expect(screen.getByText(user.firstname[0])).toBeInTheDocument();
    expect(screen.getByText(user.lastname[0])).toBeInTheDocument();
    await productElements(products);
  });

  it("showDialog should be called 1 times when userId is copied", async () => {
    const userclick = userEvent.setup();
    renderComponent(<UserPage />);

    await userclick.click(await screen.findByTitle(/copy/i));
    await staticUserElements(user);
    expect(showDialogBox).toHaveBeenCalled();
    expect(await screen.findByAltText("Banner")).toBeInTheDocument();
    expect(await screen.findByAltText("Profile Pic")).toBeInTheDocument();
    await productElements(products);
  });

  it("Edit and delete buttons are hidden when userId mismatch", async () => {
    vi.mocked(useGlobalContext).mockImplementation(() => ({
      auth: {
        userId: "667c852933acad2623688b9b",
      },
      showDialogBox: vi.fn(),
    }));

    renderComponent(<UserPage />);

    await staticUserElements(user);
    expect(
      screen.queryByRole("button", { name: /create/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /edit/i }),
    ).not.toBeInTheDocument();
    await productElements(products);
    for (const product of products) {
      expect(
        screen.queryByTestId(`threedot${product._id}`),
      ).not.toBeInTheDocument();
      expect(
        await screen.findByTestId(`cartIcon${product._id}`),
      ).toBeInTheDocument();
    }
    expect(
      screen.queryByTestId("profilePicadminicons"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("banneradminicons")).not.toBeInTheDocument();
  });

  it("displays an error message when the user not found API call fails", async () => {
    const mockUseAxiosPrivate = vi.mocked(useAxiosPrivate);

    mockUseAxiosPrivate.mockImplementation(() => ({
      get: vi.fn().mockRejectedValueOnce({ response: { status: 400 } }),
    }));

    renderComponent(<UserPage />);

    expect(await screen.findByText("User Not Found")).toBeInTheDocument();
    expect(screen.queryByText(user.address.city)).not.toBeInTheDocument();
    expect(screen.queryByText(user.address.country)).not.toBeInTheDocument();
    expect(screen.queryByText(`Id: ${user._id}`)).not.toBeInTheDocument();
    expect(screen.queryByText(user.firstname)).not.toBeInTheDocument();
    expect(screen.queryByText(user.lastname)).not.toBeInTheDocument();
    for (const product of products) {
      expect(screen.queryByText(product.name)).not.toBeInTheDocument();
      expect(screen.queryByAltText(product.name)).not.toBeInTheDocument();
      expect(
        screen.queryByText(product.description.substring(0, 90)),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(`$${product.price}`)).not.toBeInTheDocument();
      expect(
        screen.queryByText(`(${product.ratingCount} reviews)`),
      ).not.toBeInTheDocument();
    }
  });

  it("displays an error message when API call fails", async () => {
    const mockUseAxiosPrivate = vi.mocked(useAxiosPrivate);

    mockUseAxiosPrivate.mockImplementation(() => ({
      get: vi.fn().mockRejectedValueOnce({ response: { status: 500 } }),
    }));

    renderComponent(<UserPage />);

    expect(
      await screen.findByText("Something went wrong try again later"),
    ).toBeInTheDocument();
    expect(screen.queryByText(user.address.city)).not.toBeInTheDocument();
    expect(screen.queryByText(user.address.country)).not.toBeInTheDocument();
    expect(screen.queryByText(`Id: ${user._id}`)).not.toBeInTheDocument();
    expect(screen.queryByText(user.firstname)).not.toBeInTheDocument();
    expect(screen.queryByText(user.lastname)).not.toBeInTheDocument();
    for (const product of products) {
      expect(screen.queryByText(product.name)).not.toBeInTheDocument();
      expect(screen.queryByAltText(product.name)).not.toBeInTheDocument();
      expect(
        screen.queryByText(product.description.substring(0, 90)),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(`$${product.price}`)).not.toBeInTheDocument();
      expect(
        screen.queryByText(`(${product.ratingCount} reviews)`),
      ).not.toBeInTheDocument();
    }
  });

  it("When Product Deleted it should display `Product deleted successfully` message`", async () => {
    vi.spyOn(window, "confirm").mockImplementation(() => true);

    const userClick = userEvent.setup();

    renderComponent(<UserPage />);

    for (const product of products) {
      await userClick.click(
        await screen.findByTestId(`threedot${product._id}`),
      );
      await userClick.click(
        await screen.findByTestId(`deleteBtn${product._id}`),
      );
      await waitFor(() => {
        expect(showDialogBox).toHaveBeenCalledWith(
          true,
          "success",
          "Product deleted successfully",
        );
        expect(screen.queryByText(product.name)).not.toBeInTheDocument();
      });
    }
  });

  it("Should throw bad request error if product not found", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: response }),
      delete: vi.fn().mockRejectedValueOnce({
        response: { status: 400, data: { message: "Product Not Found" } },
      }),
    }));

    vi.spyOn(window, "confirm").mockImplementation(() => true);

    const userClick = userEvent.setup();

    renderComponent(<UserPage />);

    for (const product of products) {
      await userClick.click(
        await screen.findByTestId(`threedot${product._id}`),
      );
      await userClick.click(
        await screen.findByTestId(`deleteBtn${product._id}`),
      );
      await waitFor(async () => {
        expect(showDialogBox).toHaveBeenCalledWith(
          true,
          "error",
          "Product Not Found",
        );
        expect(await screen.findByText(product.name)).toBeInTheDocument();
      });
    }
  });

  it("Should throw internal server error if something went wrong", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: response }),
      delete: vi.fn().mockRejectedValueOnce({ response: { status: 500 } }),
    }));

    vi.spyOn(window, "confirm").mockImplementation(() => true);

    const userClick = userEvent.setup();

    renderComponent(<UserPage />);

    for (const product of products) {
      await userClick.click(
        await screen.findByTestId(`threedot${product._id}`),
      );
      await userClick.click(
        await screen.findByTestId(`deleteBtn${product._id}`),
      );
      await waitFor(async () => {
        expect(showDialogBox).toHaveBeenCalledWith(
          true,
          "error",
          "Something went wrong try again later",
        );
        expect(await screen.findByText(product.name)).toBeInTheDocument();
      });
    }
  });

  it("When user decline window alert showDialogBox should not call", async () => {
    vi.spyOn(window, "confirm").mockImplementation(() => false);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const userClick = userEvent.setup();

    renderComponent(<UserPage />);

    for (const product of products) {
      await userClick.click(
        await screen.findByTestId(`threedot${product._id}`),
      );
      await userClick.click(
        await screen.findByTestId(`deleteBtn${product._id}`),
      );
      await waitFor(async () => {
        expect(showDialogBox).not.toHaveBeenCalledOnce();
        expect(await screen.findByText(product.name)).toBeInTheDocument();
        expect(logSpy).toHaveBeenCalledWith("User clicked Cancel");
      });
    }
  });
});
