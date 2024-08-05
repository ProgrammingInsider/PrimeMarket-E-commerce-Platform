import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { it, expect, describe, vi } from "vitest";
import ContextAPI from "../../src/context/ContextAPI";
import UpdateUserPage from "../../src/pages/UpdateUserPage";

const auth = vi.hoisted(() => ({ userId: "667c852933acad2623688b9a" }));
const setAuth = vi.hoisted(() => vi.fn());
const showDialogBox = vi.hoisted(() => vi.fn());

vi.mock("../../src/context/ContextAPI", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    useGlobalContext: vi.fn(() => ({
      auth,
      setAuth,
      showDialogBox,
    })),
  };
});

vi.mock("../../src/hooks/useAxiosPrivate", () => ({
  default: vi.fn(() => ({
    get: vi.fn().mockResolvedValue({
      data: {
        result: {
          firstname: "Amanuel",
          lastname: "Abera",
          email: "amanuelabera@gmail.com",
          phone: "+251900000000",
          address: {
            street: "Africa Avenue",
            city: "Addis Ababa",
            state: "Addis Ababa",
            country: "Ethiopia",
            postalCode: "4665",
          },
        },
      },
    }),
  })),
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ContextAPI>
        <UpdateUserPage />
      </ContextAPI>
    </BrowserRouter>,
  );
};

describe("Edit Profile", () => {
  it("should render all elements properly", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText("First Name")).toHaveValue("Amanuel");
      expect(screen.getByLabelText("Last Name")).toHaveValue("Abera");
      expect(screen.getByLabelText("Email")).toHaveValue(
        "amanuelabera@gmail.com",
      );
      expect(screen.getByLabelText("Phone Number")).toHaveValue(
        "+251900000000",
      );
      expect(screen.getByLabelText("Street")).toHaveValue("Africa Avenue");
      expect(screen.getByLabelText("City")).toHaveValue("Addis Ababa");
      expect(screen.getByLabelText("State")).toHaveValue("Addis Ababa");
      expect(screen.getByLabelText("Country")).toHaveValue("Ethiopia");
      expect(screen.getByLabelText("Postal Code")).toHaveValue("4665");
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });
  });
});
