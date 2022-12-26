import Highcharts from 'highcharts';
import { useEffect } from 'react';
import { COLORS } from '../constants/theme';
import { useBudgetContext } from '../context';
import { ChartData, ChartTooltip, LedgerDataItem } from '../types';
import { getDateFromDayOfYear, getDayOfYear, parseDate } from '../utils/date';
import { formatDate, dollarFormat, getIncomeOrExpense } from '../utils/format';
import { Loader } from './Loader';
import { useStyles } from './StatTable.styles';

export const BalanceChart = () => {
  const yAxisInterval = 5000;
  const { ledgerData } = useBudgetContext();
  const classes = useStyles();

  const getLowestBalance = (entries: Array<LedgerDataItem>) => {
    let currentTotal = ledgerData?.starting_balance || 0;
    let lowestBalance = 0;

    if (entries) {
      entries.forEach(function (entry: LedgerDataItem) {
        currentTotal += getIncomeOrExpense(entry);
        if (currentTotal < lowestBalance) {
          lowestBalance = currentTotal;
        }
      });
    }

    return lowestBalance;
  };

  const getPlotLine = (entries: Array<LedgerDataItem>) => {
    let today = new Date();

    return (entries[0]?.settledDate?.split('-')[0] || '0') !== String(today.getFullYear())
      ? null
      : [
          {
            color: COLORS.today,
            width: 1,
            dashStyle: 'dash',
            value: getDayOfYear(new Date()),
          },
        ];
  };

  const getYAxisMinimum = (minimumValue: number, interval: number) => {
    return 0 - Math.max(interval, Math.ceil(Math.abs(minimumValue) / interval) * interval);
  };

  const getGraphData = (entries: Array<LedgerDataItem>) => {
    const data = [];
    let currentTotal = ledgerData?.starting_balance || 0;
    let currentDay: number = 0;

    if (entries) {
      entries.forEach(function (entry) {
        let day = getDayOfYear(parseDate(entry.settledDate));

        if (currentDay && day > currentDay) {
          data.push([currentDay, currentTotal]);
        }
        currentDay = day;
        currentTotal += getIncomeOrExpense(entry);
      });

      data.push([currentDay, currentTotal]);
    }

    return data;
  };

  const getChartOptions = (entries: Array<LedgerDataItem>) => {
    return {
      chart: {
        type: 'area',
        backgroundColor: COLORS.sidebar,
        animation: false,
      },
      title: { text: null },
      legend: { enabled: false },
      colors: [COLORS.income],
      tooltip: {
        formatter: function (tooltip: ChartTooltip) {
          return `${formatDate(
            getDateFromDayOfYear(new Date().getFullYear(), tooltip.chart.hoverPoint?.x || 1),
          )}<br/>${dollarFormat(tooltip.chart.hoverPoint?.y || 100)}`;
        },
        borderColor: COLORS.mediumGrey,
      },
      xAxis: {
        title: {
          text: entries.length ? entries[0].settledDate.split('-')[0] : '',
        },
        gridLineWidth: 1,
        categories: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J'],
        startOnTick: true,
        endOnTick: true,
        tickAmount: 13,
        tickPositions: [0, 32, 60, 91, 121, 152, 181, 213, 244, 274, 305, 335, 365],
        plotLines: getPlotLine(ledgerData.items),
        labels: {
          formatter: function (chartData: ChartData) {
            if (chartData.value <= 31) {
              return 'J';
            } else if (chartData.value <= 59) {
              return 'F';
            } else if (chartData.value <= 90) {
              return 'M';
            } else if (chartData.value <= 120) {
              return 'A';
            } else if (chartData.value <= 151) {
              return 'M';
            } else if (chartData.value <= 181) {
              return 'J';
            } else if (chartData.value <= 212) {
              return 'J';
            } else if (chartData.value <= 243) {
              return 'A';
            } else if (chartData.value <= 273) {
              return 'S';
            } else if (chartData.value <= 304) {
              return 'O';
            } else if (chartData.value <= 334) {
              return 'N';
            } else if (chartData.value <= 364) {
              return 'D';
            } else {
              return 'J';
            }
          },
        },
      },
      yAxis: {
        title: { text: null },
        labels: {
          formatter: function (chartData: ChartData) {
            return dollarFormat(chartData.value, false, false, true);
          },
        },
        tickInterval: yAxisInterval,
        plotBands: [
          {
            color: COLORS.lightGrey,
            from: 0,
            to: 365,
          },
        ],
        min: getYAxisMinimum(getLowestBalance(entries), yAxisInterval),
      },
      plotOptions: {
        series: {
          states: {
            hover: {
              enabled: false,
            },
          },
        },
      },
      series: [
        {
          negativeColor: COLORS.expense,
          data: getGraphData(entries),
          animation: { duration: 0 },
          fillOpacity: 0.1,
        },
      ],
    };
  };

  useEffect(() => {
    if (ledgerData.items.length) {
      Highcharts.chart('chartContainer', getChartOptions(ledgerData.items));
    }
  }, [ledgerData]);

  return (
    <div id="BalanceChart" className={classes.balanceChart}>
      <span className={classes.statTableTitle}>Balances by month</span>
      <div style={{ width: '100%', height: '240px' }}>
        {ledgerData.items.length ? <div id="chartContainer" style={{ width: '100%', height: '240px' }} /> : <Loader size={24} message={'Loading'} />}
      </div>
    </div>
  );
};
