import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'
import { Loader } from "./Loader";

describe("<Loader />", () => {
  test("should render a spinner", async () => {
    const year = (new Date()).getFullYear();
    render(<Loader year={year} />);

    const spinner = await screen.findByTestId('spinner');
    expect(spinner).toBeDefined();
  });

  test("should render the year", async () => {
    const year = (new Date()).getFullYear();
    render(<Loader year={year} />);

    const loadingMessage = await screen.findByTestId('loadingMessage');
    expect(loadingMessage.innerHTML).toContain(String(year));
  });
});