export type CalculatorHistoryItem = {
  id: string;
  expression: string;
  result: string;
  createdAt: number;
};

export type ScientificAction =
  | 'sin'
  | 'cos'
  | 'tan'
  | 'log'
  | 'sqrt'
  | 'pi'
  | 'e';
