import Highcharts from 'highcharts';
import drilldown from 'highcharts/modules/drilldown';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Button } from '@blueprintjs/core';
import { COLORS } from '../constants/theme';
import { useBudgetContext } from '../context';
import { ExtendedLedgerDataItem } from '../types';
import { Loader } from './Loader';
import { BudgetTotalsDialog } from './BudgetTotalsDialog';
import { useStyles } from './StatTable.styles';
import { getCategoryNameByGuid, getSubcategoryNameByGuid } from '../utils/ledger';
drilldown(Highcharts);

interface GraphDatum {
  name: string;
  x: number;
  y: number;
  drilldown?: string;
}

interface GraphDrilldownDatum {
  name: string;
  id: string;
  data: Array<[string, number]>;
}

export const PieChart = () => {
  const { ledgerData, categories, subcategories, budgetYear } = useBudgetContext();
  const classes = useStyles();

  const getGraphData = (entries: Array<ExtendedLedgerDataItem>) => {
    const graphData: Array<GraphDatum> = [];
    const rawData: { [index: string]: number } = {};
    const uncategorized: string = 'Uncategorized';

    if (entries) {
      let totalSpending = 0;

      entries.forEach((entry) => {
        if (entry.type_id !== 1) {
          totalSpending += entry.amount;
          const key: string =
            getCategoryNameByGuid(entry.category_guid!, categories) || uncategorized;
          if (!rawData[key]) {
            rawData[key] = 0;
          }
          rawData[key] += entry.amount;
        }
      });

      Object.keys(rawData).forEach((key) => {
        graphData.push({
          name: key,
          x: rawData[key],
          y: (rawData[key] / totalSpending) * 100,
          drilldown: key.toLowerCase(),
        });
      });
    }

    return graphData;
  };

  const getDrilldownSeries = (entries: Array<ExtendedLedgerDataItem>) => {
    const seriesData: Array<GraphDrilldownDatum> = [];
    const rawData: { [index: string]: { [index: string]: number } } = {};
    const uncategorized: string = 'Uncategorized';

    if (entries) {
      entries.forEach((entry) => {
        if (entry.type_id !== 1) {
          const key: string =
            getCategoryNameByGuid(entry.category_guid!, categories) || uncategorized;
          const subkey: string =
            getSubcategoryNameByGuid(entry.subcategory_guid!, subcategories) || uncategorized;
          if (!rawData[key]) {
            rawData[key] = {};
            rawData[key]._subtotal = 0;
          }
          rawData[key]._subtotal += entry.amount;
          if (!rawData[key][subkey]) {
            rawData[key][subkey] = 0;
          }
          rawData[key][subkey] += entry.amount;
        }
      });

      Object.keys(rawData).forEach((key) => {
        const data: Array<[string, number]> = [];
        Object.keys(rawData[key]).map((subkey) => {
          if (subkey !== '_subtotal') {
            data.push([subkey, (rawData[key][subkey] / rawData[key]._subtotal) * 100]);
          }
        });
        seriesData.push({
          name: key,
          id: key.toLowerCase(),
          data,
        });
      });
    }

    return seriesData;
  };

  const [isTotalsDialogOpen, setIsTotalsDialogOpen] = useState(false);

  const totalsByCategory = useMemo(() => {
    const rawData: {
      [category: string]: {
        total: number;
        subcategories: { [subcategory: string]: number };
      };
    } = {};
    const uncategorized = 'Uncategorized';

    ledgerData.items.forEach((entry) => {
      if (entry.type_id !== 1) {
        const categoryName =
          getCategoryNameByGuid(entry.category_guid!, categories) || uncategorized;
        const subcategoryName =
          getSubcategoryNameByGuid(entry.subcategory_guid!, subcategories) || uncategorized;

        if (!rawData[categoryName]) {
          rawData[categoryName] = {
            total: 0,
            subcategories: {},
          };
        }

        rawData[categoryName].total += entry.amount;
        rawData[categoryName].subcategories[subcategoryName] =
          (rawData[categoryName].subcategories[subcategoryName] || 0) + entry.amount;
      }
    });

    return Object.keys(rawData).map((category) => ({
      category,
      total: rawData[category].total,
      subcategories: Object.keys(rawData[category].subcategories).map((name) => ({
        name,
        total: rawData[category].subcategories[name],
      })),
    }));
  }, [ledgerData.items, categories, subcategories]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const totalBudget = totalsByCategory.reduce((sum, category) => sum + category.total, 0);

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const openTotalsDialog = () => setIsTotalsDialogOpen(true);
  const closeTotalsDialog = () => setIsTotalsDialogOpen(false);

  const getChartOptions = (entries: Array<ExtendedLedgerDataItem>) => {
    const options = {
      chart: {
        type: 'pie',
        backgroundColor: COLORS.sidebar,
      },
      title: { text: null },
      subtitle: {
        text: 'Click the slices to view subcategory breakdowns.',
        align: 'left',
      },
      plotOptions: {
        series: {
          borderRadius: 15,
          dataLabels: [
            {
              enabled: true,
              distance: 5,
              padding: 0,
              format: '{point.name}',
            },
            {
              enabled: true,
              distance: '-30%',
              filter: {
                property: 'percentage',
                operator: '>',
                value: 5,
              },
              format: '{point.y:.1f}%',
              style: {
                fontSize: '0.9em',
                textOutline: 'none',
              },
            },
          ],
        },
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat:
          '<span style="color:{point.color}">{point.name}</span>: ' +
          '<b>{point.y:.1f}%</b> of total<br/>' +
          '<b>${point.x:,.2f}</b><br/>',
      },
      series: [
        {
          name: 'All spending',
          colorByPoint: true,
          data: getGraphData(entries),
        },
      ],
      drilldown: {
        series: getDrilldownSeries(entries),
      },
    };

    return options;
  };

  useEffect(() => {
    if (ledgerData.items.length) {
      Highcharts.setOptions({
        lang: {
          thousandsSep: ',',
        },
      });
      Highcharts.chart('piechartContainer', getChartOptions(ledgerData.items));
    }
  }, [ledgerData]);

  return (
    <div id="PieChart" className={classes.balanceChart}>
      <span className={classes.statTableTitle}>Spending by Category</span>
      <div style={{ width: '100%', height: '360px' }}>
        {ledgerData.items.length ? (
          <div id="piechartContainer" style={{ width: '100%', height: '360px' }} />
        ) : (
          <Loader size={24} message={'Loading chart'} />
        )}
      </div>
      <div className={classes.chartButtonRow}>
        <Button text="Show totals by category" intent="primary" onClick={openTotalsDialog} />
      </div>
      <BudgetTotalsDialog
        isOpen={isTotalsDialogOpen}
        onClose={closeTotalsDialog}
        totalsByCategory={totalsByCategory}
        totalBudget={totalBudget}
        budgetYear={budgetYear}
        formatCurrency={formatCurrency}
        formatPercent={formatPercent}
      />
    </div>
  );
};
