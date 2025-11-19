
import { Transaction, Goal } from '../types';
import { LOCAL_STORAGE_TRANSACTIONS_KEY, LOCAL_STORAGE_GOALS_KEY } from '../constants';

export const getTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load transactions from local storage:", error);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error("Failed to save transactions to local storage:", error);
  }
};

export const getGoals = (): Goal[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load goals from local storage:", error);
    return [];
  }
};

export const saveGoals = (goals: Goal[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error("Failed to save goals to local storage:", error);
  }
};
