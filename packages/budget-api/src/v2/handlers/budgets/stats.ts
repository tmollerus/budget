import { APIGatewayProxyResult, APIGatewayEvent, EventBridgeEvent } from 'aws-lambda';
import { updateStatsrecord, getBudget, getBudgetItemsByYear, getBudgets, getStatsByYear } from '../../../managers/dynamodb';
import { BudgetRecord, StatsRecord } from '../../../types';

export const getHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);

  const budgetGuid = event.pathParameters?.budgetGuid || '';
  const year = event.queryStringParameters?.year || '';

  try {
    const stats = await getStatsByYear(budgetGuid, year);
    
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
    items?.forEach((item) => {
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
    await updateStatsrecord(budgetGuid, year.toString(), stats);
    
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
