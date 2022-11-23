import { BUDGET_API } from '../constants/budgetApi';
import { OKTA } from '../constants/okta';
import { BudgetAuthResponse, LedgerData } from '../types';

export const getBudgetGuid = async (): Promise<BudgetAuthResponse> => {
  return fetch(`${BUDGET_API.HOST}/v1/auth/login/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthorization()}`,
    },
  }).then(response => {
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
    }
    return response.json();
  });
};

export const getBudget = async (budgetGUID: string, year: string): Promise<LedgerData> => {
  return fetch(`${BUDGET_API.HOST}/v1/budgets/${budgetGUID}/?year=${year}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthorization()}`,
    },
  })
  .then((response) => response.json())
  .then((data) => {
    return data;
  })
  .catch((err) => {
    return Promise.reject(err);
  });
};

export const getBudgetItems = async (budgetGUID: string, year: string) => {
  return fetch(`${BUDGET_API.HOST}/v1/budgets/${budgetGUID}/items/?year=${year}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getAuthorization()}`,
    },
  })
  .then((response) => response.json())
  .then((data) => {
    return data;
  })
  .catch((err) => {
    return Promise.reject(err);
  });
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
  } else {
    throw new Error('No auth token exists in sessionStorage');
  }
};

export const getIdentification = () => {
  const oktaTokenStorage = JSON.parse(sessionStorage.getItem(OKTA.TOKEN_STORAGE_KEY) || '{}');

  if (oktaTokenStorage.idToken) {
    return oktaTokenStorage.idToken.claims;
  } else {
    throw new Error('No ID token exists in sessionStorage');
  }
};
