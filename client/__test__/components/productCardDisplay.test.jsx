import { render, screen, waitFor } from "@testing-library/react";
import { it, expect, describe, beforeEach } from "vitest";
import ProductCardDisplay from "../../src/components/common/ProductCardDisplay";
import { BrowserRouter } from "react-router-dom";
import ContextAPI from "../../src/context/ContextAPI";
import userEvent from "@testing-library/user-event";

const renderComponent = (component) => {
  return render(
    <BrowserRouter>
      <ContextAPI>{component}</ContextAPI>
    </BrowserRouter>,
  );
};

const mockData = {
  status: true,
  user: {
    address: {
      street: "Africa Avenue",
      city: "Addis Ababa",
      state: "Addis Ababa",
      country: "Ethiopia",
    },
    _id: "667c852933acad2623688b9a",
    firstname: "Amanuel",
    lastname: "Abera",
    email: "amanuelabera46@gmail.com",
    phone: "+251922112208",
    bannerPic:
      "https://res.cloudinary.com/dahgxnpog/image/upload/v1720556438/banners/cmswvft7d4ybwzjohofh.jpg",
    bannerPublicId: "banners/cmswvft7d4ybwzjohofh",
    profilePic:
      "https://res.cloudinary.com/dahgxnpog/image/upload/v1720556552/profiles/zguzpujcwkao5vhsyycp.png",
    profilePublicId: "profiles/zguzpujcwkao5vhsyycp",
    isVerified: false,
    createdAt: "2024-06-26T21:16:25.271Z",
    updatedAt: "2024-07-10T17:57:46.008Z",
    __v: 0,
  },
  productQuantity: 5,
  products: [
    {
      _id: "66899fcff23bb40c881b077c",
      name: "Shure SM7B",
      description:
        "The Shure SM7B is a dynamic cardioid microphone designed for professional broadcast, podcasting, and recording. Known for its versatility and iconic sound.",
      price: 399,
      averageRating: 4.5,
      ratingCount: 4,
      imageUrl:
        "https://res.cloudinary.com/dahgxnpog/image/upload/v1720295374/products/fzxsezlzzwy6yvkyf6w6.jpg",
      publicId: "products/fzxsezlzzwy6yvkyf6w6",
    },
    {
      _id: "6689a1eff23bb40c881b0784",
      name: "Apple MacBook Air M2",
      description:
        "The Apple MacBook Air M2 is a lightweight and powerful laptop featuring the latest M2 chip, a 13.6-inch retina display, and a sleek, durable aluminum chassis. Ideal for both professionals and students.",
      price: 1199.99,
      averageRating: 5.1,
      ratingCount: 3,
      imageUrl:
        "https://res.cloudinary.com/dahgxnpog/image/upload/v1720295918/products/ycondmy656dc1zj1fosx.jpg",
      publicId: "products/ycondmy656dc1zj1fosx",
    },
    {
      _id: "6689a2a6f23bb40c881b078c",
      name: "Canon EOS R5",
      description:
        "The Canon EOS R5 is a full-frame mirrorless camera that delivers exceptional image quality, 45 megapixel resolution, 8k video recording, and advanced autofocus capabilities. Perfect for both photography and videography.",
      price: 3899.99,
      averageRating: 4.5,
      ratingCount: 2,
      imageUrl:
        "https://res.cloudinary.com/dahgxnpog/image/upload/v1720296102/products/widztjwxcvktd6nx1qnl.jpg",
      publicId: "products/widztjwxcvktd6nx1qnl",
    },
  ],
  role: 221122,
};

const deleteProduct = vi.fn();

const defaultElementsInTheDocument = (product) => {
  expect(screen.getByText(product.name)).toBeInTheDocument();
  expect(screen.getByAltText(product.name)).toBeInTheDocument();
  expect(
    screen.getByText(product.description.substring(0, 90)),
  ).toBeInTheDocument();
  expect(screen.getByText(`$${product.price}`)).toBeInTheDocument();
  expect(
    screen.getByText(`(${product.ratingCount} reviews)`),
  ).toBeInTheDocument();
};

describe("ProductCardDisplay Component", () => {
  let localMockData;
  let products;
  let role;

  beforeEach(() => {
    localMockData = { ...mockData };
    products = localMockData.products;
    role = localMockData.role;
  });

  it("should display all elements properly", () => {
    renderComponent(
      <ProductCardDisplay
        products={products}
        role={role}
        deleteProduct={deleteProduct}
      />,
    );

    for (const product of products) {
      defaultElementsInTheDocument(product);
      expect(
        screen.queryByTestId(`threedot${product._id}`),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId(`cartIcon${product._id}`),
      ).toBeInTheDocument();
    }
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
  });

  it("should display three dot icons and hide cart icons when role is admin", () => {
    localMockData.role = 112208;
    renderComponent(
      <ProductCardDisplay
        products={products}
        role={localMockData.role}
        deleteProduct={deleteProduct}
      />,
    );

    for (const product of products) {
      defaultElementsInTheDocument(product);
      expect(screen.getByTestId(`threedot${product._id}`)).toBeInTheDocument();
      expect(
        screen.queryByTestId(`cartIcon${product._id}`),
      ).not.toBeInTheDocument();
    }
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
  });

  it("should display edit and delete options when three dot icon is clicked", async () => {
    localMockData.role = 112208;
    const user = userEvent.setup();

    renderComponent(
      <ProductCardDisplay
        products={products}
        role={localMockData.role}
        deleteProduct={deleteProduct}
      />,
    );

    for (const product of products) {
      defaultElementsInTheDocument(product);
      expect(screen.getByTestId(`threedot${product._id}`)).toBeInTheDocument();
      expect(
        screen.queryByTestId(`cartIcon${product._id}`),
      ).not.toBeInTheDocument();
      await user.click(screen.getByTestId(`threedot${product._id}`));
      expect(screen.getByTestId(`editBtn${product._id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`deleteBtn${product._id}`)).toBeInTheDocument();
    }
  });

  it("should call deleteProduct function when delete option is clicked", async () => {
    localMockData.role = 112208;
    const user = userEvent.setup();

    vi.spyOn(window, "confirm").mockImplementation(() => true);

    renderComponent(
      <ProductCardDisplay
        products={products}
        role={localMockData.role}
        deleteProduct={deleteProduct}
      />,
    );

    for (const product of products) {
      defaultElementsInTheDocument(product);
      await user.click(screen.getByTestId(`threedot${product._id}`));
      await user.click(screen.getByTestId(`deleteBtn${product._id}`));
      await waitFor(() =>
        expect(
          screen.queryByTestId(`loader${product._id}`),
        ).not.toBeInTheDocument(),
      );
    }

    expect(deleteProduct).toHaveBeenCalledTimes(products.length);
  });

  it('should display "No Products Uploaded" text if no products are uploaded', () => {
    localMockData.products = [];

    renderComponent(
      <ProductCardDisplay
        products={localMockData.products}
        role={localMockData.role}
        deleteProduct={deleteProduct}
      />,
    );
    expect(screen.getByText(/no products uploaded/i)).toBeInTheDocument();
  });
});
