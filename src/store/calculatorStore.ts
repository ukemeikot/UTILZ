import { create } from 'zustand';

import type { CalculatorHistoryItem } from '../types/calculator.types';

type CalculatorStore = {
  history: CalculatorHistoryItem[];
  addHistoryItem: (expression: string, result: string) => void;
  clearHistory: () => void;
};

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  history: [],
  addHistoryItem: (expression, result) =>
    set((state) => ({
      history: [
        {
          id: `${Date.now()}-${Math.random()}`,
          expression,
          result,
          createdAt: Date.now(),
        },
        ...state.history,
      ].slice(0, 8),
    })),
  clearHistory: () => set({ history: [] }),
}));
