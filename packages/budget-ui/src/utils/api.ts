import { APP } from '../constants/app';
import { BudgetAuthResponse, LedgerData } from '../types';
import { getAuthorization } from './session';

export const getBudgetGuid = async (): Promise<BudgetAuthResponse> => {
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/auth/login`, {
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
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGUID}?year=${year}`, {
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
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGUID}/items?year=${year}`, {
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

export const createEntry = async (budgetGUID: string, entry: any) => {
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGUID}/items`, {
    method: 'POST',
    body: JSON.stringify(Object.assign(entry, {budget_guid: budgetGUID})),
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

export const updateEntry = async (budgetGUID: string, entry: any) => {
  const entryNoNulls = Object.fromEntries(Object.entries(entry).filter(([_, v]) => v != null));
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGUID}/items/${entry.guid}`, {
    method: 'PUT',
    body: JSON.stringify(entryNoNulls),
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

export const deleteEntry = async (budgetGUID: string, entryGuid: string) => {
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGUID}/items/${entryGuid}`, {
    method: 'PUT',
    body: JSON.stringify({ active: false }),
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

export const getNextYearsCount = async (budgetGUID: string, year: string) => {
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGUID}/${year}/count`, {
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

export const copyBudget = async (budgetGUID: string, sourceYear: number, destinationYear: number) => {
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGUID}/${sourceYear}/copy?to=${destinationYear}`, {
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
