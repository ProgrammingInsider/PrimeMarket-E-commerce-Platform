import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect, describe, vi, beforeEach } from "vitest";
import PostProductPage from "../../src/pages/PostProductPage";
import { BrowserRouter, useParams } from "react-router-dom";
import ContextAPI from "../../src/context/ContextAPI";
import useAxiosPrivate from "../../src/hooks/useAxiosPrivate";
import { productDetail } from "../SampleDatas/productDetailResponse";
import { getCategories } from "../../src/services/get";
import { categories } from "../SampleDatas/categories";

vi.mock("../../src/services/get");

vi.mock("../../src/hooks/useAxiosPrivate", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useParams: vi.fn(() => ({ productid: "" })),
  };
});

const showDialogBox = vi.hoisted(() => vi.fn());
vi.mock("../../src/context/ContextAPI", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useGlobalContext: vi.fn(() => ({
      showDialogBox,
    })),
  };
});

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ContextAPI>
        <PostProductPage />
      </ContextAPI>
    </BrowserRouter>,
  );
};

const mockInputValues = {
  Category: "669bd33d3377976616749db3",
  Name: "Phone",
  Price: "1999.99",
  Description: "my product description",
  Stock: "10",
  "Sku (optional)": "SKU-phone",
  Weight: "10.5",
  "Dimensions (optional)": "12X12X12",
  "Brand (optional)": "iPhone",
  "choose image": new File(
    [new Blob(["dummy content"], { type: "image/png" })],
    "example.png",
    { type: "image/png", lastModified: new Date().getTime() },
  ),
};

describe("Post Product Page", () => {
  beforeEach(() => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: productDetail }),
      put: vi.fn().mockResolvedValue({ data: { message: "Product updated" } }),
      post: vi
        .fn()
        .mockResolvedValue({ data: { message: "Product Uploaded" } }),
    }));
    vi.mocked(getCategories).mockResolvedValue(categories);
  });

  it("should all elements render properly", async () => {
    renderComponent();
    expect(
      screen.getByRole("heading", { name: /create/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /edit/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/basic/i)).toBeInTheDocument();
    expect(screen.getByText(/inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/attributes/i)).toBeInTheDocument();
    for (const label of Object.keys(mockInputValues)) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /edit/i }),
    ).not.toBeInTheDocument();
  });

  it("should create new product when all required fields are inserted properly", async () => {
    const user = userEvent.setup();

    renderComponent();

    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn();
    }
    const objectURL = "mocked-object-url";
    vi.spyOn(URL, "createObjectURL").mockReturnValue(objectURL);

    await user.click(screen.getByLabelText("Category"));
    await user.selectOptions(
      screen.getByLabelText("Category"),
      mockInputValues["Category"],
    );
    await user.upload(
      screen.getByLabelText("choose image"),
      mockInputValues["choose image"],
    );

    for (const [label, value] of Object.entries(mockInputValues)) {
      if (label !== "Category" && label !== "choose image") {
        await user.type(screen.getByLabelText(label), value);
      }
    }

    for (const [label, value] of Object.entries(mockInputValues)) {
      if (label !== "Category" && label !== "choose image") {
        expect(screen.getByLabelText(label)).toHaveValue(value);
      }
    }

    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(showDialogBox).toHaveBeenCalledWith(
      true,
      "success",
      "Product Uploaded",
    );

    for (const [label, value] of Object.entries(mockInputValues)) {
      if (label !== "choose image") {
        expect(screen.getByLabelText(label)).toHaveValue("");
      }
    }
  });

  it("should throw error when product upload is failed", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: productDetail }),
      put: vi.fn().mockResolvedValue({ data: { message: "Product updated" } }),
      post: vi.fn().mockRejectedValueOnce({
        response: {
          data: { message: "something went wrong, please try again" },
        },
      }),
    }));

    const user = userEvent.setup();

    renderComponent();

    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn();
    }
    const objectURL = "mocked-object-url";
    vi.spyOn(URL, "createObjectURL").mockReturnValue(objectURL);

    await user.click(screen.getByLabelText("Category"));
    await user.selectOptions(
      screen.getByLabelText("Category"),
      mockInputValues["Category"],
    );
    await user.upload(
      screen.getByLabelText("choose image"),
      mockInputValues["choose image"],
    );

    for (const [label, value] of Object.entries(mockInputValues)) {
      if (label !== "Category" && label !== "choose image") {
        await user.type(screen.getByLabelText(label), value);
      }
    }

    for (const [label, value] of Object.entries(mockInputValues)) {
      if (label !== "Category" && label !== "choose image") {
        expect(screen.getByLabelText(label)).toHaveValue(value);
      }
    }

    await user.click(screen.getByRole("button", { name: /create/i }));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "error",
        "something went wrong, please try again",
      );
    });
  });

  it("should throw an error when categories failed to fetch", async () => {
    vi.mocked(getCategories).mockRejectedValueOnce(
      new Error("failed to fetch"),
    );

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderComponent();

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        "something went wrong, please try again",
      );
    });
  });

  it("should display previous product Information when product id is provided for edit product", async () => {
    const user = userEvent.setup();

    vi.mocked(useParams).mockImplementation(() => ({
      productid: "667c852933acad2623688b9a",
    }));

    renderComponent();

    expect(
      screen.queryByRole("button", { name: /create/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();

    expect(await screen.findByLabelText("Name")).toHaveValue(
      "iphone 14 pro max",
    );
    expect(await screen.findByLabelText("Price")).toHaveValue("1099.99");
    await user.selectOptions(
      screen.getByLabelText("Category"),
      "669bd33d3377976616749db3",
    );
    expect(screen.getByLabelText("Category")).toHaveValue(
      "669bd33d3377976616749db3",
    );
    expect(await screen.findByLabelText("Stock")).toHaveValue("100");
    expect(await screen.findByLabelText("Description")).toHaveValue(
      "the iphone 14 pro max features a 6.7-inch super retina xdr display, the a16 bionic chip, and advanced triple-camera system with 48 mp wide, 12 mp ultra-wide, and 12 mp telephoto lenses. available in multiple colors and storage options.",
    );
    expect(await screen.findByLabelText("Sku (optional)")).toHaveValue(
      "iphone-14-pro-max",
    );
    expect(await screen.findByLabelText("Weight")).toHaveValue("0.24");
    expect(await screen.findByLabelText("Dimensions (optional)")).toHaveValue(
      "6.33x3.05x0.31",
    );
    expect(await screen.findByLabelText("Brand (optional)")).toHaveValue(
      "apple",
    );
    expect(await screen.findByAltText("Product Image Preview")).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/dahgxnpog/image/upload/v1720446881/products/y0wdqzjdizhhzce27y2p.jpg",
    );

    await user.type(screen.getByLabelText("Name"), "iPhone 14 pro");
    await user.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "success",
        "Product updated",
      );
    });
  });

  it("should throw an error if product update failed", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      get: vi.fn().mockResolvedValue({ data: productDetail }),
      put: vi.fn().mockRejectedValue({
        response: {
          data: { message: "Something went wrong please try again" },
        },
      }),
    }));
    const user = userEvent.setup();

    vi.mocked(useParams).mockImplementation(() => ({
      productid: "667c852933acad2623688b9a",
    }));

    renderComponent();

    await waitFor(async () => {
      await user.selectOptions(
        screen.getByLabelText("Category"),
        "669bd33d3377976616749db3",
      );
      expect(await screen.findByLabelText("Category")).toHaveValue(
        "669bd33d3377976616749db3",
      );
    });

    await user.type(screen.getByLabelText("Name"), "iPhone 14 pro");
    await user.click(screen.getByRole("button", { name: /edit/i }));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "error",
        "Something went wrong please try again",
      );
    });
  });
});
