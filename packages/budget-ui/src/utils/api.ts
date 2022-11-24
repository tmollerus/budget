import { APP } from '../constants/app';
import { BudgetAuthResponse, LedgerData } from '../types';
import { getAuthorization } from './session';

export const getBudgetGuid = async (): Promise<BudgetAuthResponse> => {
  return fetch(`${process.env.API_HOST || APP.HOSTS.API}/v1/auth/login/`, {
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
  return fetch(`${process.env.API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGUID}/?year=${year}`, {
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
  return fetch(`${process.env.API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGUID}/items/?year=${year}`, {
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
