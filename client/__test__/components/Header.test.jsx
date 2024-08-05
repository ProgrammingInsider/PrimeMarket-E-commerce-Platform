import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, describe, beforeEach, vi } from "vitest";
import Header from "../../src/components/layout/Header";
import ContextAPI, { useGlobalContext } from "../../src/context/ContextAPI";
import useAxiosPrivate from "../../src/hooks/useAxiosPrivate";
import useLogout from "../../src/hooks/useLogout";
import { categories } from "../SampleDatas/categories";
import { getCategories } from "../../src/services/get";
import { BrowserRouter, useNavigate } from "react-router-dom";

vi.mock("../../src/services/get");

// vi.mocked(useNavigate).mockReturnValue(navigate)

const navigate = vi.hoisted(() => vi.fn());
vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    useNavigate: vi.fn(() => navigate),
  };
});

const setCartItem = vi.hoisted(() => vi.fn());
const setFilters = vi.hoisted(() => vi.fn());
const setActiveSubCategory = vi.hoisted(() => vi.fn());
const setActiveCategory = vi.hoisted(() => vi.fn());

const filters = vi.hoisted(() => ({
  Category: "All",
  Lower_Price: "",
  Higher_Price: "",
  Ratings: "",
  search: "",
}));

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
      setCartItem,
      setFilters,
      filters,
      setActiveSubCategory,
      setActiveCategory,
    })),
  };
});

const logout = vi.fn();
vi.mock("../../src/hooks/useAxiosPrivate", () => ({
  __esModule: true,
  default: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({ data: { length: 5 } }),
  })),
}));

vi.mock("../../src/hooks/useLogout");

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ContextAPI>
        <Header />
      </ContextAPI>
    </BrowserRouter>,
  );
};

describe("Header Component", () => {
  beforeEach(() => {
    useLogout.mockReturnValue(logout);
    vi.mocked(getCategories).mockResolvedValue(categories);
  });

  it("should all elements render proprly", async () => {
    renderComponent();

    const logo = screen.getAllByText(/prime/i);
    logo.forEach((item) => {
      expect(item).toBeInTheDocument();
    });
    const search = screen.getAllByText(/search/i);
    search.forEach((item) => {
      expect(item).toBeInTheDocument();
    });
    const logoutBtn = screen.getAllByText(/logout/i);
    logoutBtn.forEach((btn) => {
      expect(btn).toBeInTheDocument();
    });
    expect(screen.getByText(/categories/i)).toBeInTheDocument();
    expect(screen.getByText(/cart/i)).toBeInTheDocument();
    expect(screen.getByTestId("closeMenu")).toBeInTheDocument();
    expect(screen.getByTestId("showMenu")).toBeInTheDocument();
    expect(screen.getByText(/account/i)).toBeInTheDocument();
    expect(screen.getByText("Amanuel Abera")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/what are you looking for/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();

    await waitFor(() => {
      expect(setCartItem).toHaveBeenCalledWith(5);
    });

    for (const category of categories.results) {
      expect(
        screen.queryByText(category.category_name),
      ).not.toBeInTheDocument();
    }
  });

  it("should display all categories when all categories button clicked", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByText(/all categories/i));

    for (const category of categories.results) {
      expect(
        await screen.findByText(category.category_name),
      ).toBeInTheDocument();
    }
  });

  it("should call filter function when sub categories clicked", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(screen.getByText(/all categories/i));

    for (const category of categories.results) {
      if (category.parent_category !== null) {
        await user.click(screen.getByText(category.category_name));

        await waitFor(() => {
          expect(setFilters).toHaveBeenCalledWith({
            ...filters,
            Category: category.category_name,
          });
          expect(setActiveSubCategory).toHaveBeenCalledWith(category._id);
          expect(setActiveCategory).toHaveBeenCalledWith(
            category.parent_category,
          );
          expect(navigate).toHaveBeenCalledWith("/");
        });
      }
    }
  });

  it("should throw an error when failed to fetch all categories", async () => {
    const user = userEvent.setup();

    vi.mocked(getCategories).mockRejectedValueOnce(
      new Error("something went wrong, please try again"),
    );

    renderComponent();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await user.click(screen.getByText(/all categories/i));

    await waitFor(async () => {
      expect(logSpy).toHaveBeenCalledWith(
        "something went wrong, please try again",
      );
    });
  });

  it("when user is not logged in username should omit and sign in button should display instead of logout", async () => {
    vi.mocked(useGlobalContext).mockImplementationOnce(() => ({
      auth: {
        userId: "",
        firstname: "",
        lastname: "",
        accessToken: "",
      },
      filters: {
        Category: "All",
        Lower_Price: "",
        Higher_Price: "",
        Ratings: "",
        search: "",
      },
    }));

    renderComponent();

    expect(screen.queryByText(/account/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Amanuel Abera")).not.toBeInTheDocument();
    expect(screen.queryByText(5)).not.toBeInTheDocument();
    const logoutBtn = screen.queryAllByText(/logout/i);
    logoutBtn.forEach((btn) => {
      expect(btn).not.toBeInTheDocument();
    });

    const signinBtn = await screen.findAllByText(/signin/i);
    signinBtn.forEach((btn) => {
      expect(btn).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(setCartItem).not.toHaveBeenCalledWith(5);
    });
  });

  it("Should omit user name and display sign in button instead of logout when user logged out", async () => {
    const user = userEvent.setup();

    renderComponent();

    const logoutBtn = screen.queryAllByText(/logout/i);

    for (const btn of logoutBtn) {
      await user.click(btn);
      await waitFor(() => {
        expect(logout).toHaveBeenCalled();
      });
    }
  });

  it("should call setFilter function when user search for something on search bar", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.type(
      screen.getByPlaceholderText(/what are you looking for/i),
      "phone",
    );
    await user.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeEnabled();
      expect(setFilters).toHaveBeenCalledWith({ ...filters, search: "phone" });
    });
  });

  it("should throw an error when failed to fetch cart items length", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockRejectedValueOnce(),
    }));

    renderComponent();

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await waitFor(async () => {
      expect(logSpy).toHaveBeenCalledWith(
        "something went wrong, please try again",
      );
    });
  });
});
