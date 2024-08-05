import { it, expect, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ContextAPI, { useGlobalContext } from "../../src/context/ContextAPI";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { signupUser } from "../../src/services/authServices";
import SignupPage from "../../src/pages/SignupPage";

vi.mock("../../src/services/authServices");

const showDialogBox = vi.fn();
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
  render(
    <BrowserRouter>
      <ContextAPI>
        <SignupPage />
      </ContextAPI>
    </BrowserRouter>,
  );

  return {
    CheckBox: screen.getByRole("checkbox"),
    SubmitBtn: screen.getByRole("button", { name: /continue/i }),
  };
};

const formData = {
  "First Name": "Amanuel",
  "Last Name": "Abera",
  Email: "test@gmail.com",
  "Phone Number": "+25192211208",
  Password: "!!Test2208!!",
  "Confirm Password": "!!Test2208!!",
  Street: "Africa Avenue",
  City: "Addis Ababa",
  State: "Addis Ababa",
  Country: "Ethiopia",
};

const fillForm = async (user, fields) => {
  for (const key in fields) {
    await user.type(screen.getByLabelText(key), fields[key]);
  }
};

describe("Signup Form Functionality", () => {
  it("should render all elements with input values correctly", async () => {
    // Arrange
    const user = userEvent.setup();
    const { CheckBox, SubmitBtn } = renderComponent();

    // Act
    await fillForm(user, formData);

    // Assert
    for (const key in formData) {
      expect(screen.getByLabelText(key)).toHaveValue(formData[key]);
    }
    expect(CheckBox).not.toBeChecked();
    expect(SubmitBtn).toBeDisabled();
  });

  it("should reset all input values and call signupUser function once upon successful registration", async () => {
    signupUser.mockResolvedValue({
      status: true,
      message: "User Registered Successfully",
      statusCode: 200,
    });

    // Arrange
    const user = userEvent.setup();
    const { CheckBox, SubmitBtn } = renderComponent();

    // Act
    await fillForm(user, formData);
    await user.click(CheckBox);
    await user.click(SubmitBtn);

    // Assert
    for (const key in formData) {
      expect(screen.getByLabelText(key)).toHaveValue("");
    }
    expect(CheckBox).not.toBeChecked();
    expect(SubmitBtn).toBeDisabled();
    expect(signupUser).toHaveBeenCalledTimes(1);
  });

  it("should display 'Email is already taken' when a 409 conflict error is thrown", async () => {
    signupUser.mockResolvedValue({
      status: true,
      message: "Email is already taken",
      statusCode: 409,
    });

    // Arrange
    const user = userEvent.setup();
    const { CheckBox, SubmitBtn } = renderComponent();

    // Act
    await fillForm(user, formData);
    await user.click(CheckBox);
    await user.click(SubmitBtn);

    // Assert
    for (const key in formData) {
      expect(screen.getByLabelText(key)).toHaveValue(formData[key]);
    }
    expect(CheckBox).toBeChecked();
    expect(SubmitBtn).toBeEnabled();
    expect(signupUser).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText("Email is already taken"),
    ).toBeInTheDocument();
    expect(showDialogBox).toHaveBeenCalledWith(
      true,
      "error",
      "Email is already taken",
    );
  });

  it("should display 'Password mismatch' when a 400 bad request error is thrown", async () => {
    signupUser.mockResolvedValue({
      status: true,
      message: "Password mismatch",
      statusCode: 400,
    });

    // Arrange
    const user = userEvent.setup();
    const { CheckBox, SubmitBtn } = renderComponent();

    // Act
    await fillForm(user, formData);
    await user.click(CheckBox);
    await user.click(SubmitBtn);

    // Assert
    for (const key in formData) {
      expect(screen.getByLabelText(key)).toHaveValue(formData[key]);
    }
    expect(CheckBox).toBeChecked();
    expect(SubmitBtn).toBeEnabled();
    expect(signupUser).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Password mismatch")).toBeInTheDocument();
    expect(showDialogBox).toHaveBeenCalledWith(
      true,
      "error",
      "Password mismatch",
    );
  });

  it("should not reset input values and call signupUser function once if registration fails", async () => {
    signupUser.mockRejectedValueOnce();

    // Arrange
    const user = userEvent.setup();
    const { CheckBox, SubmitBtn } = renderComponent();

    // Act
    await fillForm(user, formData);
    await user.click(CheckBox);
    await user.click(SubmitBtn);

    // Assert
    for (const key in formData) {
      expect(screen.getByLabelText(key)).toHaveValue(formData[key]);
    }
    expect(CheckBox).toBeChecked();
    expect(SubmitBtn).toBeEnabled();
    expect(signupUser).toHaveBeenCalledTimes(1);
    expect(showDialogBox).toHaveBeenCalledWith(
      true,
      "error",
      "Something went wrong, please try again later",
    );
  });

  it("should not call signupUser function if email is invalid", async () => {
    // Arrange
    const user = userEvent.setup();
    const { CheckBox, SubmitBtn } = renderComponent();

    // Act
    const invalidEmailData = { ...formData, Email: "testgmail.com" };
    await fillForm(user, invalidEmailData);
    await user.click(CheckBox);
    await user.click(SubmitBtn);

    // Assert
    expect(CheckBox).toBeChecked();
    expect(SubmitBtn).toBeEnabled();
    expect(signupUser).toHaveBeenCalledTimes(0);
  });

  it("should display 'Phone number must be valid' if phone number is invalid", async () => {
    // Arrange
    const user = userEvent.setup();
    const { CheckBox, SubmitBtn } = renderComponent();

    // Act
    const invalidPhoneNumberData = {
      ...formData,
      "Phone Number": "+25192211208a",
    };
    await fillForm(user, invalidPhoneNumberData);
    await user.click(CheckBox);
    await user.click(SubmitBtn);

    const ErrorMessage = screen.getByText(/Phone number must be valid/i);

    // Assert
    expect(CheckBox).toBeChecked();
    expect(SubmitBtn).toBeEnabled();
    expect(signupUser).toHaveBeenCalledTimes(0);
    expect(ErrorMessage).toBeInTheDocument();
  });

  it("should display 'Password must contain one uppercase letter, one lowercase letter, one digit, and one special character' if password is invalid", async () => {
    // Arrange
    const user = userEvent.setup();
    const { CheckBox, SubmitBtn } = renderComponent();

    // Act
    const invalidPasswordData = {
      ...formData,
      Password: "!!test2208!!",
      "Confirm Password": "!!test2208!!",
    };
    await fillForm(user, invalidPasswordData);
    await user.click(CheckBox);
    await user.click(SubmitBtn);

    const ErrorMessage = screen.getByText(
      /Password must contain one uppercase letter, one lowercase letter, one digit, and one special character/i,
    );

    // Assert
    expect(CheckBox).toBeChecked();
    expect(SubmitBtn).toBeEnabled();
    expect(signupUser).toHaveBeenCalledTimes(0);
    expect(ErrorMessage).toBeInTheDocument();
  });

  it("should display 'Passwords do not match' if passwords mismatch", async () => {
    // Arrange
    const user = userEvent.setup();
    const { CheckBox, SubmitBtn } = renderComponent();

    // Act
    const mismatchedPasswordData = {
      ...formData,
      Password: "!!Test2208!!",
      "Confirm Password": "!!Test2208!",
    };
    await fillForm(user, mismatchedPasswordData);
    await user.click(CheckBox);
    await user.click(SubmitBtn);

    const ErrorMessage = screen.getByText(/Passwords do not match/i);

    // Assert
    expect(CheckBox).toBeChecked();
    expect(SubmitBtn).toBeEnabled();
    expect(signupUser).toHaveBeenCalledTimes(0);
    expect(ErrorMessage).toBeInTheDocument();
  });
});
