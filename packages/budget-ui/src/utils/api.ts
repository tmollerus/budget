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

export const getBudget = async (budgetGuid: string, year: string): Promise<LedgerData> => {
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGuid}?year=${year}`, {
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

export const getBudgetItems = async (budgetGuid: string, year: string) => {
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGuid}/items?year=${year}`, {
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

export const createEntry = async (budgetGuid: string, entry: any) => {
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGuid}/items`, {
    method: 'POST',
    body: JSON.stringify(Object.assign(entry, {budget_guid: budgetGuid})),
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

export const updateEntry = async (budgetGuid: string, entry: any) => {
  const entryNoNulls = Object.fromEntries(Object.entries(entry).filter(([_, v]) => v != null));
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGuid}/items/${entry.guid}`, {
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

export const deleteEntry = async (budgetGuid: string, itemGuid: string): Promise<boolean> => {
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGuid}/items/${itemGuid}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getAuthorization()}`,
    },
  })
  .then((response) => {
    return response.ok;
  })
  .catch((err) => {
    return Promise.reject(err);
  });
};

export const copyBudget = async (budgetGuid: string, sourceYear: number, destinationYear: number) => {
  return fetch(`${process.env.REACT_APP_API_HOST || APP.HOSTS.API}/v1/budgets/${budgetGuid}/items/copy?from=${sourceYear}&to=${destinationYear}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthorization()}`,
    },
  })
  .then((response) => {
    return response.ok;
  })
  .catch((err) => {
    return Promise.reject(err);
  });
};
