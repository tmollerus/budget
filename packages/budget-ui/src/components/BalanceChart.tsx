import Highcharts from 'highcharts';
import { useEffect } from 'react';
import { COLORS } from '../constants/theme';
import { useBudgetContext } from '../context';
import { ChartData, ChartTooltip, LedgerDataItem } from '../types';
import {
  dateFormat,
  dollarFormat,
  getDateFromDayOfYear,
  getDayOfYear,
  getIncomeOrExpense,
} from '../utils/format';
import { useStyles } from './StatTable.styles';

export const BalanceChart = () => {
  const yAxisInterval = 5000;
  const { ledgerData } = useBudgetContext();
  const classes = useStyles();

  useEffect(() => {
    updateChart(ledgerData.items);
  }, [ledgerData]);

  const updateChart = (entries: Array<LedgerDataItem>) => {
    Highcharts.chart('chartContainer', {
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
          return `${dateFormat(
            getDateFromDayOfYear(new Date().getFullYear(), tooltip.chart.hoverPoint?.x || 1),
          )}<br/>${dollarFormat(tooltip.chart.hoverPoint?.y.toString().replace(' ', '') || 100)}`;
        },
        borderColor: '#999999',
      },
      xAxis: {
        title: {
          text: entries.length ? entries[0].settledDate.split('-')[0] : new Date().getFullYear(),
        },
        gridLineWidth: 1,
        categories: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J'],
        startOnTick: true,
        endOnTick: true,
        tickAmount: 13,
        tickPositions: [0, 32, 60, 91, 121, 152, 181, 213, 244, 274, 305, 335, 365],
        plotLines: getPlotLine(entries),
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
            color: '#CCC',
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
    });
  };

  const getLowestBalance = (entries: Array<LedgerDataItem>) => {
    let currentTotal = ledgerData.starting_balance,
      lowestBalance = 0;

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
    return entries[0].settledDate.split('-')[0] !== String(today.getFullYear())
      ? null
      : [
          {
            color: '#BBB',
            width: 1,
            dashStyle: 'dash',
            value: getDayOfYear(dateFormat(new Date(), 'yyyy-mm-dd') || ''),
          },
        ];
  };

  const getYAxisMinimum = (minimumValue: number, interval: number) => {
    return 0 - Math.max(interval, Math.ceil(Math.abs(minimumValue) / interval) * interval);
  };

  const getGraphData = (entries: Array<LedgerDataItem>) => {
    const data = [];
    let currentTotal = ledgerData.starting_balance;
    let currentDay: number = 0;

    if (entries) {
      entries.forEach(function (entry) {
        let day = getDayOfYear(entry.settledDate);

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

  return (
    <div id="BalanceChart">
      <span className={classes.statTableTitle}>Balances by month</span>
      <div id="chartContainer" style={{ width: '100%', height: '240px' }} />
    </div>
  );
};
