// React imports
import React from "react";
import PropTypes from "prop-types";
import Highcharts from "highcharts";
import { dateFormat, dollarFormat, getDateFromDayOfYear, getDayOfYear, getIncomeOrExpense } from "../utils/format";

class BalanceChart extends React.Component {
  constructor() {
    super();
    this.yAxisInterval = 5000;
  }

  componentDidMount() {
    this.updateChart();
  }

  componentDidUpdate() {
    this.updateChart();
  }

  updateChart() {
    Highcharts.chart("chartContainer", {
      chart: {
        type: "area",
        backgroundColor: "#F2F2F2",
        animation: false
      },
      title: { text: null },
      legend: { enabled: false },
      colors: ["#00BB00"],
      tooltip: {
        formatter: function() {
          return `${dateFormat(
            getDateFromDayOfYear(new Date().getFullYear(), this.x)
          )}<br/>${dollarFormat(this.y.toString().replace(" "))}`;
        },
        borderColor: "#999999"
      },
      xAxis: {
        title: {
          text: this.props.entries.length
            ? this.props.entries[0].settledDate.split("-")[0]
            : ""
        },
        gridLineWidth: 1,
        categories: [
          "J",
          "F",
          "M",
          "A",
          "M",
          "J",
          "J",
          "A",
          "S",
          "O",
          "N",
          "D",
          "J"
        ],
        startOnTick: true,
        endOnTick: true,
        tickAmount: 13,
        tickPositions: [
          0,
          32,
          60,
          91,
          121,
          152,
          181,
          213,
          244,
          274,
          305,
          335,
          365
        ],
        plotLines: this.getPlotLine(this.props.entries),
        labels: {
          formatter: function() {
            if (this.value <= 31 || this.value === "J") {
              return "J";
            } else if (this.value <= 59) {
              return "F";
            } else if (this.value <= 90) {
              return "M";
            } else if (this.value <= 120) {
              return "A";
            } else if (this.value <= 151) {
              return "M";
            } else if (this.value <= 181) {
              return "J";
            } else if (this.value <= 212) {
              return "J";
            } else if (this.value <= 243) {
              return "A";
            } else if (this.value <= 273) {
              return "S";
            } else if (this.value <= 304) {
              return "O";
            } else if (this.value <= 334) {
              return "N";
            } else if (this.value <= 364) {
              return "D";
            } else {
              return "J";
            }
          }
        }
      },
      yAxis: {
        title: { text: null },
        labels: {
          formatter: function() {
            return dollarFormat(this.value, false, false, true);
          }
        },
        tickInterval: this.yAxisInterval,
        plotBands: [
          {
            color: "#CCC",
            from: 0,
            to: 365
          }
        ],
        min: this.getYAxisMinimum(
          this.getLowestBalance(this.props.entries),
          this.yAxisInterval
        )
      },
      plotOptions: {
        series: {
          states: {
            hover: {
              enabled: false
            }
          }
        }
      },
      series: [
        {
          negativeColor: "#900",
          data: this.getGraphData(this.props.entries),
          animation: { duration: 0 },
          fillOpacity: 0.1
        }
      ]
    });
  }

  pointFormatter(point) {
    return `${point.x}<br/>${dollarFormat(
      point.y.toString().replace(" ")
    )}`;
  }

  getLowestBalance(entries) {
    let currentTotal = this.props.startingBalance,
      lowestBalance = 0;

    if (entries) {
      entries.forEach(function(entry) {
        currentTotal += getIncomeOrExpense(entry);
        if (currentTotal < lowestBalance) {
          lowestBalance = currentTotal;
        }
      });
    }

    return lowestBalance;
  }

  getPlotLine(entries) {
    let today = new Date();
    return entries[0].settledDate.split("-")[0] !== today.getFullYear()
      ? null
      : [
          {
            color: "#BBB",
            width: 1,
            dashStyle: "dash",
            value: getDayOfYear(
              dateFormat(new Date(), "yyyy-mm-dd")
            )
          }
        ];
  }

  getYAxisMinimum(minimumValue, interval) {
    return (
      0 -
      Math.max(
        interval,
        Math.ceil(Math.abs(minimumValue) / interval) * interval
      )
    );
  }

  getGraphData(entries) {
    let data = [],
      currentTotal = this.props.startingBalance,
      currentDay;

    if (entries) {
      entries.forEach(function(entry) {
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
  }

  render() {
    return (
      <div id="BalanceChart">
        <span className="title">Balances by month</span>
        <div id="chartContainer" style={{ width: "100%", height: "240px" }} />
      </div>
    );
  }
}

BalanceChart.propTypes = {
  startingBalance: PropTypes.number,
  entries: PropTypes.array
};

export default BalanceChart;
