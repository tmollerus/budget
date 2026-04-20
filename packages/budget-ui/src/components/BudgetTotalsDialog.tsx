import { Fragment } from 'react';
import { Button, Dialog } from '@blueprintjs/core';
import { useStyles } from './BudgetTotalsDialog.styles';

interface CategoryData {
  category: string;
  total: number;
  subcategories: Array<{ name: string; total: number }>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  totalsByCategory: CategoryData[];
  totalBudget: number;
  budgetYear: number;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
}

export const BudgetTotalsDialog = (props: Props) => {
  const classes = useStyles();

  const sortedTotalsByCategory = props.totalsByCategory
    .sort((a, b) => b.total - a.total)
    .map((category) => ({
      ...category,
      subcategories: category.subcategories.sort((a, b) => b.total - a.total),
    }));

  return (
    <Dialog isOpen={props.isOpen} title={`${props.budgetYear} Budget totals by category`} onClose={props.onClose}>
      <div className={classes.totalsDialogBody}>
        <p>Totals are shown for spending dollars by category and subcategory.</p>
        <table className={classes.totalsTable}>
          <thead>
            <tr>
              <th>Category / Subcategory</th>
              <th>Amount</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {sortedTotalsByCategory.map((categoryData) => (
              <Fragment key={categoryData.category}>
                <tr className={classes.categoryRow}>
                  <td>{categoryData.category}</td>
                  <td>{props.formatCurrency(categoryData.total)}</td>
                  <td className={classes.percentCell}>
                    {props.totalBudget ? props.formatPercent(categoryData.total / props.totalBudget) : '0.0%'}
                  </td>
                </tr>
                {categoryData.subcategories.map((subcategory) => (
                  <tr key={`${categoryData.category}-${subcategory.name}`}>
                    <td className={classes.subcategoryCell}>↳ {subcategory.name}</td>
                    <td>{props.formatCurrency(subcategory.total)}</td>
                    <td className={classes.percentCell}>
                      {categoryData.total ? props.formatPercent(subcategory.total / categoryData.total) : '0.0%'}
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
            <tr className={classes.totalRow}>
              <td>Total</td>
              <td>{props.formatCurrency(props.totalBudget)}</td>
              <td className={classes.percentCell}>{props.formatPercent(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Dialog>
  );
};