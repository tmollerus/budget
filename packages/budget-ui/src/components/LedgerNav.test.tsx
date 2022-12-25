import { fireEvent, render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'
import { LedgerNav } from "./LedgerNav";
import { getMonthAsName } from "../utils/format";

describe("<LedgerNav />", () => {
  test("should render navigation between years", async () => {
    const year = (new Date()).getFullYear();
    const scrollToMonth = jest.fn();
    render(<LedgerNav scrollToMonth={scrollToMonth} />);

    const yearNav = await screen.findByTestId('yearNav');
    expect(yearNav.innerHTML).toContain(String(year));
  });

  test("should render navigation between months", async () => {
    const scrollToMonth = jest.fn();
    render(<LedgerNav scrollToMonth={scrollToMonth} />);

    [0,1,2,3,4,5,6,7,8,9,10,11].forEach(async (index) => {
      const month = await screen.findByTestId(`monthNav${index}`);
      expect(month.innerHTML).toContain(getMonthAsName(index));
      fireEvent.click(month, new MouseEvent('click', {bubbles: true, cancelable: true} ));
      expect(scrollToMonth).toHaveBeenCalledWith(`month-${index}`);
    });
  });
});