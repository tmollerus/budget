import { dateFormat, dollarFormat, getIncomeClass } from '../utils/format';
import { STAT_PLACEHOLDER } from '../constants/theme';
import { LedgerDataItem } from '../types';
import { useStyles } from './StatTable.styles';

interface Props {
  yearEnd: number;
  year: number;
  deficitDate: any;
  today: number;
  startingBalance: number;
  expensesLeft: number;
  incomeTotal: number;
  expenseTotal: number;
  transferTotal: number;
  entries: Array<LedgerDataItem>;
}

export const StatTable = (props: Props) => {
  const classes = useStyles();

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
    if (props.deficitDate) {
      return `Deficit by ${dateFormat(props.deficitDate)}`;
    } else {
      return `Surplus through ${props.year}`;
    }
  };

  const showDataOrPlaceholder = (data: any) => {
    if (props.yearEnd) {
      return data;
    } else {
      return <div className="placeholder" dangerouslySetInnerHTML={{ __html: STAT_PLACEHOLDER }} />;
    }
  };

  const outlook = getOutlook();
  const spendingDiff = props.incomeTotal - props.transferTotal - props.expenseTotal;

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
              <td className={getIncomeClass(props.today)}>
                {showDataOrPlaceholder(getFormattedAmount(props.today))}
              </td>
            </tr>
            <tr>
              <td>Expenses left this month</td>
              <td className={getIncomeClass(props.expensesLeft)}>
                {showDataOrPlaceholder(getFormattedAmount(props.expensesLeft))}
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
              <td className={getIncomeClass(props.yearEnd)}>
                {showDataOrPlaceholder(getFormattedAmount(props.yearEnd))}
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
              <td className={getIncomeClass(props.incomeTotal)}>
                {showDataOrPlaceholder(getFormattedAmount(props.incomeTotal / 12, '/mo.'))}
              </td>
              <td className={getIncomeClass(props.incomeTotal)}>
                {showDataOrPlaceholder(getFormattedAmount(props.incomeTotal))}
              </td>
            </tr>
            <tr>
              <td>Operating Expenses</td>
              <td className={getIncomeClass(props.expenseTotal)}>
                {showDataOrPlaceholder(getFormattedAmount(props.expenseTotal / 12, '/mo.'))}.
              </td>
              <td className={getIncomeClass(props.expenseTotal)}>
                {showDataOrPlaceholder(getFormattedAmount(props.expenseTotal))}
              </td>
            </tr>
            <tr>
              <td>Discretionary Spending</td>
              <td className={getIncomeClass(props.transferTotal)}>
                {showDataOrPlaceholder(getFormattedAmount(props.transferTotal / 12, '/mo.'))}
              </td>
              <td className={getIncomeClass(props.transferTotal)}>
                {showDataOrPlaceholder(getFormattedAmount(props.transferTotal))}
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
