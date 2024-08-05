import { render, screen } from "@testing-library/react";
import SigninPage from "../../src/pages/SigninPage";
import userEvent from "@testing-library/user-event";
import ContextAPI, { useGlobalContext } from "../../src/context/ContextAPI";
import { BrowserRouter } from "react-router-dom";
import { signinUser } from "../../src/services/authServices";
import { vi } from "vitest";

vi.mock("../../src/services/authServices");

const showDialogBox = vi.hoisted(() => vi.fn());
vi.mock("../../src/context/ContextAPI", async (importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    useGlobalContext: vi.fn(() => ({
      setAuth: vi.fn,
      showDialogBox,
    })),
  };
});

const renderComponent = () => {
  render(
    <BrowserRouter>
      <ContextAPI>
        <SigninPage />
      </ContextAPI>
    </BrowserRouter>,
  );

  return {
    SubmitBtn: screen.getByRole("button", { name: /continue/i }),
  };
};

const formData = {
  Email: "amanuelabera46@gmail.com",
  Password: "!!Aman2208!!",
};

const fillForm = async (user, fields) => {
  for (const key in fields) {
    await user.type(screen.getByLabelText(key), fields[key]);
  }
};

describe("Signin Form Functionality", () => {
  it("should render all elements", async () => {
    const user = userEvent.setup();
    const { SubmitBtn } = renderComponent();
    await fillForm(user, formData);

    for (const key in formData) {
      expect(screen.getByLabelText(key)).toHaveValue(formData[key]);
    }
    expect(SubmitBtn).toBeInTheDocument();
  });

  it("should call signinUser function at least once when logged in successfully", async () => {
    signinUser.mockResolvedValue({
      message: "Logged In Successfully",
      statusCode: 200,
    });

    const user = userEvent.setup();
    const { SubmitBtn } = renderComponent();
    await fillForm(user, formData);
    await user.click(SubmitBtn);

    for (const key in formData) {
      expect(screen.getByLabelText(key)).toHaveValue("");
    }
    expect(signinUser).toHaveBeenCalledTimes(1);
    expect(showDialogBox).toHaveBeenCalledWith(
      true,
      "success",
      "Logged In Successfully",
    );
  });

  it("should not call signinUser function when email is invalid", async () => {
    const invalidFormData = { ...formData, Email: "amanuelabera46gmail.com" };
    const user = userEvent.setup();
    const { SubmitBtn } = renderComponent();
    await fillForm(user, invalidFormData);
    await user.click(SubmitBtn);

    for (const key in invalidFormData) {
      expect(screen.getByLabelText(key)).toHaveValue(invalidFormData[key]);
    }
    expect(signinUser).toHaveBeenCalledTimes(0);
  });

  it("should display an error message when the password is incorrect", async () => {
    signinUser.mockResolvedValue({
      message: "Incorrect Password",
      statusCode: 401,
    });

    const user = userEvent.setup();
    const { SubmitBtn } = renderComponent();
    await fillForm(user, formData);
    await user.click(SubmitBtn);

    for (const key in formData) {
      expect(screen.getByLabelText(key)).toHaveValue(formData[key]);
    }
    expect(await screen.findByText("Incorrect Password")).toBeInTheDocument();
    expect(showDialogBox).toHaveBeenCalledWith(
      true,
      "error",
      "Incorrect Password",
    );
  });

  it("should display an error message when the email is not registered", async () => {
    signinUser.mockResolvedValue({
      message: "Email address is not registered",
      statusCode: 401,
    });

    const user = userEvent.setup();
    const { SubmitBtn } = renderComponent();
    await fillForm(user, formData);
    await user.click(SubmitBtn);

    for (const key in formData) {
      expect(screen.getByLabelText(key)).toHaveValue(formData[key]);
    }
    expect(
      await screen.findByText("Email address is not registered"),
    ).toBeInTheDocument();
    expect(showDialogBox).toHaveBeenCalledWith(
      true,
      "error",
      "Email address is not registered",
    );
  });

  it("should thriw an error when signinUser failed", async () => {
    signinUser.mockRejectedValueOnce({});

    const user = userEvent.setup();
    const { SubmitBtn } = renderComponent();
    await fillForm(user, formData);
    await user.click(SubmitBtn);

    for (const key in formData) {
      expect(screen.getByLabelText(key)).toHaveValue(formData[key]);
    }
    expect(showDialogBox).toHaveBeenCalledWith(
      true,
      "error",
      "Something went wrong try again later",
    );
  });
});
