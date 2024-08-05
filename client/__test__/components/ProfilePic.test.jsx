import { render, screen, waitFor } from "@testing-library/react";
import { it, expect, describe, vi } from "vitest";
import ProfilePic from "../../src/components/common/ProfilePic";
import { BrowserRouter } from "react-router-dom";
import ContextAPI from "../../src/context/ContextAPI";
import { response } from "../SampleDatas/userInfoResponse";
import useAxiosPrivate from "../../src/hooks/useAxiosPrivate";
import userEvent from "@testing-library/user-event";

const showDialogBox = vi.fn();
const setUserInfo = vi.fn();

// Mocking the ContextAPI and useAxiosPrivate hooks
vi.mock("../../src/context/ContextAPI", () => ({
  _esModule: true,
  default: vi.fn(({ children }) => children),
  useGlobalContext: vi.fn(() => ({
    showDialogBox,
  })),
}));

vi.mock("../../src/hooks/useAxiosPrivate", () => ({
  _esModule: true,
  default: vi.fn(() => ({
    put: vi.fn().mockResolvedValue({
      data: {
        message: "Profile Pic Updated",
        url: "https://newimage.com/profile/123",
        publicId: "profile/123",
      },
    }),
    delete: vi
      .fn()
      .mockResolvedValue({ data: { message: "Profile Pic deleted" } }),
  })),
}));

const renderComponent = (component) => {
  return render(
    <BrowserRouter>
      <ContextAPI>{component}</ContextAPI>
    </BrowserRouter>,
  );
};

describe("Banner Component", () => {
  let user;
  beforeEach(() => {
    user = response.user;
  });

  // Test case to verify that all elements are displayed properly
  it("should display all elements correctly", async () => {
    renderComponent(
      <ProfilePic userInfo={user} setUserInfo={setUserInfo} role={112208} />,
    );

    expect(screen.getByTestId("profilePicadminicons")).toBeInTheDocument();
    expect(screen.getByAltText("Profile Pic")).toBeInTheDocument();
    expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
  });

  it("should display the first character of firstname and lastname if profilePic is null all elements correctly", async () => {
    renderComponent(
      <ProfilePic
        userInfo={{ ...user, profilePic: null }}
        setUserInfo={setUserInfo}
        role={112208}
      />,
    );

    expect(screen.getByText(user.firstname[0])).toBeInTheDocument();
    expect(screen.getByText(user.lastname[0])).toBeInTheDocument();
    expect(screen.queryByAltText("Profile Pic")).not.toBeInTheDocument();
  });
  // Test case to verify that the edit icons are hidden for non-admin users
  it("should hide edit and delete icons for users with role 112211", async () => {
    renderComponent(
      <ProfilePic userInfo={user} setUserInfo={setUserInfo} role={112211} />,
    );

    expect(
      screen.queryByTestId("profilePicadminicons"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("editprofileicon")).not.toBeInTheDocument();
    expect(screen.getByAltText("Profile Pic")).toBeInTheDocument();
  });

  // Test case to verify that clicking the edit icon shows the success message
  it('should display "Profile Pic Updated" message when the user update Profile Pic', async () => {
    const userClick = userEvent.setup();
    const file = new File(
      [new Blob(["dummy content"], { type: "image/png" })],
      "example.png",
      { type: "image/png", lastModified: new Date().getTime() },
    );

    renderComponent(
      <ProfilePic userInfo={user} setUserInfo={setUserInfo} role={112208} />,
    );

    const editIcon = screen.getByTestId("editprofileicon");
    await userClick.click(editIcon);
    await userClick.upload(editIcon, file);

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "success",
        "Profile Pic Updated",
      );
    });

    expect(setUserInfo).toHaveBeenCalledWith({
      ...user,
      profilePic: "https://newimage.com/profile/123",
      profilePublicId: "profile/123",
    });
  });

  // Test case to verify that showDialogBox is not called if no file is selected
  it("should not call showDialogBox if no file is selected", async () => {
    const userClick = userEvent.setup();

    renderComponent(
      <ProfilePic userInfo={user} setUserInfo={setUserInfo} role={112208} />,
    );

    const editIcon = screen.getByTestId("editprofileicon");
    await userClick.click(editIcon);
    await userClick.upload(editIcon, []);

    await waitFor(() => {
      expect(showDialogBox).not.toHaveBeenCalled();
    });
  });

  // Test case to verify that "Incorrect Public Id" message is shown for bad request errors
  it('should display "Incorrect Public Id" message for bad request errors during profile pic update', async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      put: vi.fn().mockRejectedValueOnce({
        response: { status: 400, data: { message: "Incorrect Public Id" } },
      }),
    }));

    const userClick = userEvent.setup();
    const file = new File(
      [new Blob(["dummy content"], { type: "image/png" })],
      "example.png",
      { type: "image/png", lastModified: new Date().getTime() },
    );

    renderComponent(
      <ProfilePic userInfo={user} setUserInfo={setUserInfo} role={112208} />,
    );

    const editIcon = screen.getByTestId("editprofileicon");
    await userClick.click(editIcon);
    await userClick.upload(editIcon, file);

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "error",
        "Incorrect Public Id",
      );
    });
  });

  // Test case to verify that "Something went wrong" message is shown for server errors during banner update
  it('should display "Something went wrong, try again later" message for server errors during banner update', async () => {
    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      put: vi.fn().mockRejectedValueOnce({ response: { status: 500 } }),
    }));

    const userClick = userEvent.setup();

    const file = new File(
      [new Blob(["dummy content"], { type: "image/png" })],
      "example.png",
      { type: "image/png", lastModified: new Date().getTime() },
    );

    renderComponent(
      <ProfilePic userInfo={user} setUserInfo={setUserInfo} role={112208} />,
    );

    const editIcon = screen.getByTestId("editprofileicon");
    await userClick.click(editIcon);
    await userClick.upload(editIcon, file);

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "error",
        "Something went wrong, try again later",
      );
    });
  });

  // Test case to verify that the banner is deleted when the delete icon is clicked and the user confirms the action
  it("should delete the banner when the delete icon is clicked and the user confirms the action", async () => {
    const userClick = userEvent.setup();

    vi.spyOn(window, "confirm").mockImplementation(() => true);

    renderComponent(
      <ProfilePic userInfo={user} setUserInfo={setUserInfo} role={112208} />,
    );

    await userClick.click(screen.getByTestId("deleteprofileicon"));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "success",
        "Profile Pic deleted",
      );
      expect(setUserInfo).toHaveBeenCalledWith({
        ...user,
        profilePic: null,
        profilePublicId: "null",
      });
    });
  });

  // Test case to verify that "Incorrect Public Id" message is shown for bad request errors during banner deletion
  it('should display "Incorrect Public Id" message for bad request errors during banner deletion', async () => {
    const userClick = userEvent.setup();

    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      delete: vi.fn().mockRejectedValueOnce({
        response: { status: 400, data: { message: "Incorrect Public Id" } },
      }),
    }));

    vi.spyOn(window, "confirm").mockImplementation(() => true);

    renderComponent(
      <ProfilePic userInfo={user} setUserInfo={setUserInfo} role={112208} />,
    );

    await userClick.click(screen.getByTestId("deleteprofileicon"));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "error",
        "Incorrect Public Id",
      );
    });
  });

  // Test case to verify that "Something went wrong" message is shown for server errors during banner deletion
  it('should display "Something went wrong, try again later" message for server errors during banner deletion', async () => {
    const userClick = userEvent.setup();

    vi.mocked(useAxiosPrivate).mockImplementation(() => ({
      delete: vi.fn().mockRejectedValueOnce({ response: { status: 500 } }),
    }));

    vi.spyOn(window, "confirm").mockImplementation(() => true);

    renderComponent(
      <ProfilePic userInfo={user} setUserInfo={setUserInfo} role={112208} />,
    );

    await userClick.click(screen.getByTestId("deleteprofileicon"));

    await waitFor(() => {
      expect(showDialogBox).toHaveBeenCalledWith(
        true,
        "error",
        "Something went wrong, try again later",
      );
    });
  });

  // Test case to verify that no action is taken when the user cancels the delete confirmation
  it("should not delete the banner if the user cancels the confirmation dialog", async () => {
    const userClick = userEvent.setup();

    vi.spyOn(window, "confirm").mockImplementation(() => false);

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderComponent(
      <ProfilePic userInfo={user} setUserInfo={setUserInfo} role={112208} />,
    );

    await userClick.click(screen.getByTestId("deleteprofileicon"));

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith("User clicked Cancel");
    });
  });
});
