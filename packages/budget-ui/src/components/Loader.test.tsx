import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'
import { Loader } from "./Loader";

describe("<Loader />", () => {
  test("should render a spinner", async () => {
    render(<Loader />);

    const spinner = await screen.findByTestId('spinner');
    expect(spinner).toBeDefined();
  });

  test("should render the message", async () => {
    const year = (new Date()).getFullYear();
    const message = `Loading ${year} budget`;
    render(<Loader message={message} />);

    const loadingMessage = await screen.findByTestId('loadingMessage');
    expect(loadingMessage.innerHTML).toContain(message);
  });

  test("shouldn't render a message if none is supplied", async () => {
    render(<Loader />);

    const noLoadingMessage = screen.queryByTestId('loadingMessage');
    expect(noLoadingMessage).toBeNull();
  });
});