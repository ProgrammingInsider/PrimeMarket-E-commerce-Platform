import { render, screen, waitFor } from "@testing-library/react";
import { it, expect, describe, vi } from "vitest";
import Alert from "../../src/components/layout/Alert";
import ContextAPI, { useGlobalContext } from "../../src/context/ContextAPI";
import { BrowserRouter } from "react-router-dom";

const showDialogBox = vi.hoisted(() => vi.fn());
vi.mock("../../src/context/ContextAPI", async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    useGlobalContext: vi.fn(() => ({
      alertVisibility: true,
      alertType: "success",
      alertMessage: "alerted",
      showDialogBox,
    })),
  };
});

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ContextAPI>
        <Alert />
      </ContextAPI>
    </BrowserRouter>,
  );
};

describe("Alert Component", () => {
  it("should show Dialog box", async () => {
    renderComponent();

    expect(screen.getByText("alerted")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(showDialogBox).toHaveBeenCalledWith(false, "", "");
      },
      { timeout: 6000 },
    );
  });

  it("should hide Dialog box", async () => {
    vi.mocked(useGlobalContext).mockImplementationOnce(() => ({
      alertVisibility: false,
      alertType: "success",
      alertMessage: "alerted",
    }));
    renderComponent();

    expect(screen.getByTestId("alert")).toHaveClass("hideAlert");
  });
});
