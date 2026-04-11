export function calculateBmi(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category = 'Normal';
  let accent: 'success' | 'muted' | 'warning' | 'danger' = 'success';

  if (bmi < 18.5) {
    category = 'Underweight';
    accent = 'muted';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    accent = 'warning';
  } else if (bmi >= 30) {
    category = 'Obese';
    accent = 'danger';
  }

  return {
    bmi,
    category,
    accent,
  };
}
