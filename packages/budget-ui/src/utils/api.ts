import { BUDGET_API } from '../constants/budgetApi';
import { OKTA } from '../constants/okta';
import { LedgerDataItem } from '../types';

export const getBudgetGuid = async () => {
  const response = await fetch(`https://${BUDGET_API.HOST}/auth/login/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthorization()}`,
    },
  });

  const {data, errors} = await response.json();

  if (response.ok) {
    return data;
  } else {
    const error = new Error(errors?.map((e: any) => e.message).join('\n') ?? 'unknown');
    return Promise.reject(error);
  }
};

export const getBudget = async (budgetGUID: string, year: string) => {
  const response = await fetch(`https://${BUDGET_API.HOST}/budgets/${budgetGUID}/?year=${year}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthorization()}`,
    },
  });

  const {data, errors} = await response.json();

  if (response.ok) {
    return JSON.parse(data).map((item: LedgerDataItem) => {
      item.settledDate = item.settledDate.split("T")[0];
      return item;
    });
  } else {
    const error = new Error(errors?.map((e: any) => e.message).join('\n') ?? 'unknown');
    return Promise.reject(error);
  }
};

export const getEntries = async (budgetGUID: string, year: string) => {
  const response = await fetch(`https://${BUDGET_API.HOST}/budgets/${budgetGUID}/items/?year=${year}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthorization()}`,
    },
  });

  const {data, errors} = await response.json();

  if (response.ok) {
    return JSON.parse(data).map((item: LedgerDataItem) => {
      item.settledDate = item.settledDate.split("T")[0];
      return item;
    });
  } else {
    const error = new Error(errors?.map((e: any) => e.message).join('\n') ?? 'unknown');
    return Promise.reject(error);
  }
};

// createEntry(budgetGUID, entry, callback) {
//   axios.defaults.headers.common['Authorization'] = this.getAuthorization();
//   axios.post(
//     constants.API_URL + '/budgets/' + budgetGUID + '/items/',
//     entry
//   )
//   .then(function (response) {
//     callback(response.data);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
// },

// updateEntry(budgetGUID, entry) {
//   axios.defaults.headers.common['Authorization'] = this.getAuthorization();
//   axios.put(
//     constants.API_URL + '/budgets/' + budgetGUID + '/items/' + entry.guid,
//     entry
//   )
//   .then(function (response) {
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
// },

// deleteEntry(budgetGUID, entryGUID) {
//   axios.defaults.headers.common['Authorization'] = this.getAuthorization();
//   axios.put(
//     constants.API_URL + '/budgets/' + budgetGUID + '/items/' + entryGUID,
//     {
//       active: false
//     }
//   )
//   .then(function (response) {
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
// },

// getNextYearsCount(budgetGUID, year, callback) {
//   axios.defaults.headers.common['Authorization'] = this.getAuthorization();
//   axios.get(
//     constants.API_URL + `/budgets/${budgetGUID}/${year}/count`,
//     {
//       withCredentials: true
//     }
//   )
//   .then(function (response) {
//     callback(response.data);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
// },

// copyBudget(budgetGUID, sourceYear, destinationYear, successCallback, failureCallback) {
//   axios.defaults.headers.common['Authorization'] = this.getAuthorization();
//   axios.post(
//     constants.API_URL + `/budgets/${budgetGUID}/${sourceYear}/items/copy?to=${destinationYear}`,
//     {},
//     {
//       withCredentials: true
//     }
//   )
//   .then(function (response) {
//     successCallback(destinationYear);
//   })
//   .catch(function (error) {
//     console.log(error);
//     failureCallback(destinationYear);
//   });
// },

export const getAuthorization = () => {
  const oktaTokenStorage = JSON.parse(sessionStorage.getItem(OKTA.TOKEN_STORAGE_KEY) || '{}');

  if (oktaTokenStorage.accessToken) {
    return oktaTokenStorage.accessToken.accessToken;
  }
};

export const getIdentification = () => {
  const oktaTokenStorage = JSON.parse(sessionStorage.getItem(OKTA.TOKEN_STORAGE_KEY) || '{}');

  if (oktaTokenStorage.idToken) {
    return oktaTokenStorage.idToken.claims;
  }
};
