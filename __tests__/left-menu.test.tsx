import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

// Mocks shared between tests
const showMock = jest.fn();
const mockGetMenuNodes = jest.fn();

// Mock the DI container used by LeftMenu to return our mock service
jest.mock(require.resolve("../app/di"), () => ({
  container: {
    get: () => ({ getMenuNodes: mockGetMenuNodes }),
  },
}));

// Mock PrimeReact Toast so we can assert that `show` was called
jest.mock("primereact/toast", () => {
  const React = require("react");
  return {
    Toast: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({ show: showMock }));
      return React.createElement("div", { "data-testid": "toast-mock" });
    }),
  };
});

// Mock Next App Router's `useRouter` so components using it can render in tests
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), pathname: "/" }),
}));

// Import the component under test AFTER setting up module mocks
import LeftMenu from "../app/(main)/components/menu/left/left-menu";

describe("LeftMenu", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loader then renders menu nodes on success", async () => {
    // Arrange: mock service returns a simple menu node
    mockGetMenuNodes.mockResolvedValue([
      { key: "1", label: "User", data: { href: "/user" } },
    ]);

    // Act
    const { container } = render(<LeftMenu />);

    // Spinner should be present initially
    expect(container.querySelector(".p-progress-spinner")).toBeInTheDocument();

    // Wait for the node label to appear and spinner to go away
    await waitFor(() => expect(screen.getByText("User")).toBeInTheDocument());
    expect(container.querySelector(".p-progress-spinner")).toBeNull();
  });

  it("shows toast when service returns an ErrorResponseDto", async () => {
    // Import DTO to construct an error instance
    const { ErrorResponseDto } = require("../app/network/error-response.dto");

    // Arrange: service returns an ErrorResponseDto
    mockGetMenuNodes.mockResolvedValue(
      new ErrorResponseDto("Network error", 500)
    );

    // Act
    render(<LeftMenu />);

    // Assert: toast.show should be called with an error severity
    await waitFor(() =>
      expect(showMock).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "error" })
      )
    );
  });
});
