import { render, screen, waitFor } from "@testing-library/react";
import { it, expect, describe, beforeEach, vi } from "vitest";
import Footer from "../../src/components/layout/Footer";
import { BrowserRouter } from "react-router-dom";
import ContextAPI, { useGlobalContext } from "../../src/context/ContextAPI";

vi.mock("../../src/context/ContextAPI", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    useGlobalContext: vi.fn(() => ({
      auth: {
        userId: "667c852933acad2623688b9a",
      },
    })),
  };
});

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ContextAPI>
        <Footer />
      </ContextAPI>
    </BrowserRouter>,
  );
};

describe("Footer Component", () => {
  beforeEach(() => {});

  it("should render all elements properly", () => {
    renderComponent();
    const prime = screen.getAllByText(/Prime/i);
    prime.forEach((prime) => {
      expect(prime).toBeInTheDocument();
    });

    const listItem = screen.getAllByRole("listitem");
    listItem.forEach((item) => {
      expect(item).toBeInTheDocument();
    });
    expect(listItem.length).toBe(14);

    const heading = screen.getAllByRole("heading");
    heading.forEach((heading) => {
      expect(heading).toBeInTheDocument();
    });
    expect(heading.length).toBe(7);

    const img = screen.getAllByRole("img");
    img.forEach((img) => {
      expect(img).toBeInTheDocument();
    });
    expect(img.length).toBe(3);

    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();

    expect(screen.getByRole("button")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Your email address"),
    ).toBeInTheDocument();

    expect(screen.getByText("My Account")).toBeInTheDocument();
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
  });

  it("should display signin instead of account when user not logged in", async () => {
    vi.mocked(useGlobalContext).mockImplementationOnce(() => ({
      auth: {
        userId: "",
      },
    }));

    renderComponent();

    expect(screen.queryByText("My Account")).not.toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });
});
