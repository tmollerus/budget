import { APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { updateStatsrecord, getBudget, getBudgetItemsByYear, getStatsByYear } from '../../../managers/dynamodb';
import { BudgetRecord, StatsRecord } from '../../../types';

export const getHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const year = event.queryStringParameters?.year || '';
  const refresh = event.queryStringParameters?.refresh || '';

  try {
    let stats: StatsRecord | void;
    if (refresh === "true" || Number(year) > new Date().getFullYear()) {
      stats = await writeStatsRecord(budgetGuid, year);
    } else {
      stats = await getStatsByYear(budgetGuid, year);
      if (!stats) {
        stats = await writeStatsRecord(budgetGuid, year, true);
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({...stats}),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};

export const putHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const year = event.queryStringParameters?.year || '';

  try {
    const stats: StatsRecord | void = await writeStatsRecord(budgetGuid, year);
    
    return {
      statusCode: 200,
      body: JSON.stringify({...stats}),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({err}),
    };
  }
};

const writeStatsRecord = async (budgetGuid: string, year: string, create: boolean = false): Promise<StatsRecord | void> => {
  try {
    const budgetRecord = await getBudget(budgetGuid);
    let startingBalance = Number(budgetRecord?.starting_balance) || 0;
  
    const items = await getBudgetItemsByYear(budgetGuid, year.toString(), true);
    const yearsChange = items!.reduce((acc, item) => {
      if (!item.active) {
        return acc;
      } else if (item.type_id === 1) {
        return acc + item.amount;
      } else {
        return acc - item.amount;
      }
    }, 0);
    startingBalance += yearsChange;

    const nextYear = Number(year) + 1;
    const nextYearsItems = await getBudgetItemsByYear(budgetGuid, nextYear.toString());

    const stats: StatsRecord = {
      startingBalance: startingBalance,
      nextYearItemCount: nextYearsItems?.length || 0,
      totals: {
        income: 0,
        transfer: 0,
        expense: 0,
      },
      categories: {},
    };

    const thisYearsItems = await getBudgetItemsByYear(budgetGuid, year);
    thisYearsItems?.forEach((item) => {
      if (item.type_id === 1) {
        stats.totals.income += item.amount;
      } else if (item.type_id === 2) {
        stats.totals.transfer += item.amount;
      } else {
        stats.totals.expense += item.amount;
      }
      if (item.category_guid) {
        if (!stats.categories[item.category_guid]) {
          stats.categories[item.category_guid] = {};
          stats.categories[item.category_guid].total = 0;
        }
        stats.categories[item.category_guid].total += item.amount;
        if (item.subcategory_guid) {
          if (!stats.categories[item.category_guid][item.subcategory_guid]) {
            stats.categories[item.category_guid][item.subcategory_guid] = 0;
          }
          stats.categories[item.category_guid][item.subcategory_guid] += item.amount;
        }
      }
    });

    if (create) {
      stats.dateCreated = new Date().toISOString();
    }
    await updateStatsrecord(budgetGuid, year.toString(), stats);

    return stats;
  } catch (err) {
    console.error(err);

    return;
  }
};
