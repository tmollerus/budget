import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetTotalsDialog } from './BudgetTotalsDialog';

describe('BudgetTotalsDialog', () => {
  const mockOnClose = jest.fn();
  const mockFormatCurrency = jest.fn((value: number) => `$${value.toFixed(2)}`);
  const mockFormatPercent = jest.fn((value: number) => `${(value * 100).toFixed(1)}%`);

  const sampleTotalsByCategory = [
    {
      category: 'Food',
      total: 500,
      subcategories: [
        { name: 'Groceries', total: 300 },
        { name: 'Dining Out', total: 200 },
      ],
    },
    {
      category: 'Transportation',
      total: 300,
      subcategories: [
        { name: 'Gas', total: 200 },
        { name: 'Public Transit', total: 100 },
      ],
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    totalsByCategory: sampleTotalsByCategory,
    totalBudget: 800,
    budgetYear: 2023,
    formatCurrency: mockFormatCurrency,
    formatPercent: mockFormatPercent,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog when isOpen is true', () => {
    render(<BudgetTotalsDialog {...defaultProps} />);
    expect(screen.getByText('2023 Budget totals by category')).toBeInTheDocument();
    expect(screen.getByText('Totals are shown for spending dollars by category and subcategory.')).toBeInTheDocument();
  });

  it('does not render the dialog when isOpen is false', () => {
    render(<BudgetTotalsDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('2023 Budget totals by category')).not.toBeInTheDocument();
  });

  it('displays category and subcategory data correctly', () => {
    render(<BudgetTotalsDialog {...defaultProps} />);
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('↳ Groceries')).toBeInTheDocument();
    expect(screen.getByText('↳ Dining Out')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getByText('↳ Gas')).toBeInTheDocument();
    expect(screen.getByText('↳ Public Transit')).toBeInTheDocument();
  });

  it('displays formatted currency and percentages', () => {
    render(<BudgetTotalsDialog {...defaultProps} />);
    expect(mockFormatCurrency).toHaveBeenCalledWith(500);
    expect(mockFormatCurrency).toHaveBeenCalledWith(300);
    expect(mockFormatPercent).toHaveBeenCalledWith(500 / 800); // 0.625
    expect(mockFormatPercent).toHaveBeenCalledWith(300 / 500); // 0.6
  });

  it('displays the total row', () => {
    render(<BudgetTotalsDialog {...defaultProps} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(mockFormatCurrency).toHaveBeenCalledWith(800);
    expect(mockFormatPercent).toHaveBeenCalledWith(1);
  });

  it('handles empty totalsByCategory', () => {
    render(<BudgetTotalsDialog {...defaultProps} totalsByCategory={[]} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(mockFormatCurrency).toHaveBeenCalledWith(800);
  });

  it('handles zero totalBudget', () => {
    render(<BudgetTotalsDialog {...defaultProps} totalBudget={0} />);
    // When totalBudget is 0, category percentages should be '0.0%' without calling formatPercent
    expect(screen.getAllByText('0.0%')).toHaveLength(2); // Food and Transportation categories
    expect(mockFormatPercent).toHaveBeenCalledWith(1); // Only for total
  });
});