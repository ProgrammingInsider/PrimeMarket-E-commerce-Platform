import {
  findByRole,
  findByText,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { it, expect, describe, beforeEach, vi } from "vitest";
import ContextAPI, { useGlobalContext } from "../../src/context/ContextAPI";
import Rating from "../../src/components/common/Rating";
import { getRate } from "../../src/services/cartServices";
import useAxiosPrivate from "../../src/hooks/useAxiosPrivate";
import { ratingResponse } from "../SampleDatas/ratingResponse";

const showDialogBox = vi.hoisted(() => vi.fn());

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

vi.mock("../../src/services/cartServices", () => ({
  getRate: vi.fn(),
}));

vi.mock("../../src/hooks/useAxiosPrivate", () => ({
  _esModule: true,
  default: vi.fn(() => ({
    post: vi.fn().mockResolvedValue({
      data: {
        message: "Rate product 4/5",
        user: {
          _id: "667c852933acad2623688b9a",
          firstname: "Amanuel",
          lastname: "Abera",
          profilePic:
            "https://res.cloudinary.com/dahgxnpog/image/upload/v1720865508/profiles/ncqt7rgj7vhm1g7zixya.png",
          productId: "667c852933acad2623688b9a",
          rating: "4",
          comment: "Good Product",
        },
      },
    }),
  })),
}));

const renderComponent = (ratingCount, averageRating, productid) => {
  return render(
    <BrowserRouter>
      <ContextAPI>
        <Rating
          ratingCount={ratingCount}
          averageRating={averageRating}
          productid={productid}
        />
      </ContextAPI>
    </BrowserRouter>,
  );
};

describe("Rating Component", () => {
  let rates;
  beforeEach(() => {
    rates = ratingResponse.result;
    vi.mocked(getRate).mockResolvedValue({
      length: ratingResponse.length,
      result: ratingResponse.result,
    });
  });

  it("Elements should display properly", async () => {
    renderComponent(2, 3.5, "667c852933acad2623688b9a");
    expect(screen.getByText("Rating and reviews")).toBeInTheDocument();
    expect(screen.getByText(3.5)).toBeInTheDocument();
    expect(screen.getByText("(2 reviews)")).toBeInTheDocument();
    expect(screen.getByText(5)).toBeInTheDocument();
    expect(screen.getByText(4)).toBeInTheDocument();
    expect(screen.getByText(3)).toBeInTheDocument();
    expect(screen.getByText(2)).toBeInTheDocument();
    expect(screen.getByText(1)).toBeInTheDocument();
    [1, 2, 3, 4, 5].forEach((star) => {
      expect(screen.getByTitle(`Rate product ${star}/5`)).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: /submit/i }),
    ).not.toBeInTheDocument();
    for (const rate of rates) {
      expect(await screen.findByText(rate.user.firstname)).toBeInTheDocument();
      expect(await screen.findByText(rate.user.lastname)).toBeInTheDocument();
      if (rate.user.profilePic === null) {
        expect(
          await screen.findByText(
            `${rate.user.firstname[0]}${rate.user.lastname[0]}`,
          ),
        ).toBeInTheDocument();
      } else {
        expect(
          await screen.findByAltText(`${rate.user.firstname} User Image`),
        ).toBeInTheDocument();
      }
      expect(
        await screen.findByText(rate.updatedAt.split("T")[0]),
      ).toBeInTheDocument();
      expect(await screen.findByText(rate.comment)).toBeInTheDocument();
    }
    expect(screen.queryByText(/no product/i)).not.toBeInTheDocument();
  });

  it('Should display "No Product Rate Found" text when no product rates', async () => {
    vi.mocked(getRate).mockResolvedValue({ length: 0, result: [] });
    renderComponent(2, 3.5, "667c852933acad2623688b9a");

    await waitFor(() => {
      expect(screen.getByText(/no product/i)).toBeInTheDocument();
    });
  });

  it('should log "Something went wrong please refresh the page" when failed to fetch rates', async () => {
    vi.mocked(getRate).mockRejectedValue(new Error("Fetch error"));

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    renderComponent(2, 3.5, "667c852933acad2623688b9a");

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith(
        "Something went wrong please refresh the page",
      );
    });
  });

  it("Should add new rate comment when submit button clicked", async () => {
    const userClick = userEvent.setup();
    renderComponent(2, 3.5, "667c852933acad2623688b9a");

    const textarea = screen.findByRole("textbox");

    await userClick.click(screen.getByTitle(`Rate product 4/5`));
    await userClick.type(await textarea, "Good Product");
    await userClick.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "success",
        "Rate product 4/5",
      );
      expect(screen.getByText("Good Product")).toBeInTheDocument();
      expect(screen.getByText("Amanuel")).toBeInTheDocument();
      expect(screen.getByText("Abera")).toBeInTheDocument();
      expect(screen.getByAltText("Amanuel User Image")).toBeInTheDocument();
    });
  });

  it("Should display 'Leave the comment' error when the user try to submit rate without typing the comment", async () => {
    const userClick = userEvent.setup();
    renderComponent(2, 3.5, "667c852933acad2623688b9a");

    const textarea = screen.findByRole("textbox");

    await userClick.click(screen.getByTitle(`Rate product 4/5`));
    await userClick.click(screen.getByText(/submit/i));
    expect(await screen.findByText("Leave the comment")).toBeInTheDocument();

    await waitFor(() => {
      expect(showDialogBox).not.toHaveBeenCalledOnce();
    });
  });

  it("Should display 'please login first' text if the user not logged in", async () => {
    vi.mocked(useGlobalContext).mockImplementation(() => ({
      auth: {},
      showDialogBox,
    }));
    const userClick = userEvent.setup();
    renderComponent(2, 3.5, "667c852933acad2623688b9a");

    const textarea = screen.findByRole("textbox");

    await userClick.click(screen.getByTitle(`Rate product 4/5`));
    await userClick.type(await textarea, "Good Product");
    await userClick.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "warning",
        "Please Login First",
      );
    });
  });

  it("Should throw bad request error when no product not found", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      post: vi.fn().mockRejectedValueOnce({
        response: { status: 400, data: { message: "product Not Found" } },
      }),
      showDialogBox,
    }));
    const userClick = userEvent.setup();
    renderComponent(2, 3.5, "667c852933acad2623688b9a");

    const textarea = screen.findByRole("textbox");

    await userClick.click(screen.getByTitle(`Rate product 4/5`));
    await userClick.type(await textarea, "Good Product");
    await userClick.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "error",
        "product Not Found",
      );
    });
  });

  it("Should throw internal server error when something went wrong", async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      post: vi.fn().mockRejectedValueOnce({ response: { status: 500 } }),
      showDialogBox,
    }));
    const userClick = userEvent.setup();
    renderComponent(2, 3.5, "667c852933acad2623688b9a");

    const textarea = screen.findByRole("textbox");

    await userClick.click(screen.getByTitle(`Rate product 4/5`));
    await userClick.type(await textarea, "Good Product");
    await userClick.click(screen.getByText(/submit/i));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "error",
        "Something went wrong try again later",
      );
    });
  });
});
