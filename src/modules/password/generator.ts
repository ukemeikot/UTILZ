export type PasswordOptions = {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
};

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>/?';

function pickRandomCharacter(pool: string) {
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

function shuffleCharacters(characters: string[]) {
  const next = [...characters];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[randomIndex];
    next[randomIndex] = current;
  }

  return next;
}

export function generatePassword(options: PasswordOptions) {
  const pools = [
    options.includeUppercase ? UPPERCASE : '',
    options.includeLowercase ? LOWERCASE : '',
    options.includeNumbers ? NUMBERS : '',
    options.includeSymbols ? SYMBOLS : '',
  ].filter(Boolean);

  if (pools.length === 0) {
    return '';
  }

  const allCharacters = pools.join('');
  const requiredCharacters = pools.map((pool) => pickRandomCharacter(pool));
  const targetLength = Math.max(options.length, requiredCharacters.length);
  const passwordCharacters = [...requiredCharacters];

  for (let index = passwordCharacters.length; index < targetLength; index += 1) {
    passwordCharacters.push(pickRandomCharacter(allCharacters));
  }

  return shuffleCharacters(passwordCharacters).join('');
}
