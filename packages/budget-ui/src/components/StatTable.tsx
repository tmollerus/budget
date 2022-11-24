import { dateFormat, dollarFormat, getIncomeClass } from '../utils/format';
import { STAT_PLACEHOLDER } from '../constants/theme';
import { Statistics } from '../types';
import { useStyles } from './StatTable.styles';
import { useBudgetContext } from '../context';
import { useEffect, useState } from 'react';
import { getStatistics } from '../utils/statistics';

export const StatTable = () => {
  const classes = useStyles();
  const [statistics, setStatistics] = useState<Statistics>();
  const { budgetYear, ledgerData } = useBudgetContext();

  useEffect(() => {
    setStatistics(getStatistics(ledgerData.items, ledgerData.starting_balance));
  }, [ledgerData]);

  const getFormattedAmount = (amount: number, suffix?: string, allowZero?: boolean) => {
    suffix = suffix || '';
    allowZero = allowZero || false;

    if (amount || (allowZero && amount === 0)) {
      return dollarFormat(amount) + suffix;
    } else {
      return;
    }
  };

  const getOutlook = () => {
    if (statistics?.deficitDate) {
      return `Deficit by ${dateFormat(statistics.deficitDate)}`;
    } else {
      return `Surplus through ${budgetYear}`;
    }
  };

  const showDataOrPlaceholder = (data: any) => {
    if (statistics?.yearEnd) {
      return data;
    } else {
      return <div className="placeholder" dangerouslySetInnerHTML={{ __html: STAT_PLACEHOLDER }} />;
    }
  };

  const outlook = getOutlook();
  const spendingDiff = (statistics?.incomeTotal || 0) - (statistics?.transferTotal || 0) - (statistics?.expenseTotal || 0);

  return (
    <div className={classes.statTable}>
      <div className={classes.header}>
        <h2>Statistics</h2>
      </div>
      <div id="balances">
        <table className={classes.statTable}>
          <tbody>
            <tr>
              <th colSpan={2}>Balances</th>
            </tr>
            <tr>
              <td>Today</td>
              <td className={getIncomeClass(statistics?.today || 0)}>
                {showDataOrPlaceholder(getFormattedAmount(statistics?.today || 0))}
              </td>
            </tr>
            <tr>
              <td>Expenses left this month</td>
              <td className={getIncomeClass(statistics?.expensesLeft || 0)}>
                {showDataOrPlaceholder(getFormattedAmount(statistics?.expensesLeft || 0))}
              </td>
            </tr>
            <tr>
              <td>Outlook</td>
              <td className={getIncomeClass(outlook.indexOf('Deficit') > -1 ? -1 : 1)}>
                {showDataOrPlaceholder(outlook)}
              </td>
            </tr>
            <tr>
              <td>Projected year-end</td>
              <td className={getIncomeClass(statistics?.yearEnd || 0)}>
                {showDataOrPlaceholder(getFormattedAmount(statistics?.yearEnd || 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div id="averages">
        <table className={classes.statTable}>
          <tbody>
            <tr>
              <th>Income and Expense</th>
              <th>Averages</th>
              <th>Totals</th>
            </tr>
            <tr>
              <td>Income</td>
              <td className={getIncomeClass(statistics?.incomeTotal || 0)}>
                {showDataOrPlaceholder(getFormattedAmount((statistics?.incomeTotal || 0) / 12, '/mo.'))}
              </td>
              <td className={getIncomeClass(statistics?.incomeTotal || 0)}>
                {showDataOrPlaceholder(getFormattedAmount(statistics?.incomeTotal || 0))}
              </td>
            </tr>
            <tr>
              <td>Operating Expenses</td>
              <td className={getIncomeClass(statistics?.expenseTotal || 0)}>
                {showDataOrPlaceholder(getFormattedAmount((statistics?.expenseTotal || 0) / 12, '/mo.'))}.
              </td>
              <td className={getIncomeClass(statistics?.expenseTotal || 0)}>
                {showDataOrPlaceholder(getFormattedAmount((statistics?.expenseTotal || 0)))}
              </td>
            </tr>
            <tr>
              <td>Discretionary Spending</td>
              <td className={getIncomeClass(statistics?.transferTotal || 0)}>
                {showDataOrPlaceholder(getFormattedAmount((statistics?.transferTotal || 0) / 12, '/mo.'))}
              </td>
              <td className={getIncomeClass(statistics?.transferTotal || 0)}>
                {showDataOrPlaceholder(getFormattedAmount(statistics?.transferTotal || 0))}
              </td>
            </tr>
            <tr>
              <td>{getIncomeClass(spendingDiff) === 'income' ? 'Surplus' : 'Deficit'}</td>
              <td className={getIncomeClass(spendingDiff)}>
                {showDataOrPlaceholder(getFormattedAmount(spendingDiff / 12, '/mo.'))}
              </td>
              <td className={getIncomeClass(spendingDiff)}>
                {showDataOrPlaceholder(getFormattedAmount(spendingDiff))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
