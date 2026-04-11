const allowedPattern = /^[0-9+\-*/().,%\sA-Za-z\u03c0\u00d7\u00f7e]+$/;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function sanitizeExpression(input: string) {
  return input
    .replace(/\u00d7/g, '*')
    .replace(/\u00f7/g, '/')
    .replace(/\u03c0/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
    .replace(/sin\(/g, 'sinDeg(')
    .replace(/cos\(/g, 'cosDeg(')
    .replace(/tan\(/g, 'tanDeg(')
    .replace(/log\(/g, 'Math.log10(')
    .replace(/sqrt\(/g, 'Math.sqrt(')
    .replace(/%/g, '/100');
}

export function evaluateExpression(expression: string) {
  if (!expression.trim()) {
    return '0';
  }

  if (!allowedPattern.test(expression)) {
    throw new Error('Unsupported input');
  }

  const normalized = sanitizeExpression(expression);
  const result = Function(
    'toRadians',
    'sinDeg',
    'cosDeg',
    'tanDeg',
    `"use strict"; return (${normalized});`,
  )(
    toRadians,
    (value: number) => Math.sin(toRadians(value)),
    (value: number) => Math.cos(toRadians(value)),
    (value: number) => Math.tan(toRadians(value)),
  );

  if (!Number.isFinite(result)) {
    throw new Error('Invalid result');
  }

  return Number(result).toPrecision(12).replace(/\.?0+$/, '');
}

export function appendToken(current: string, token: string) {
  if (current === '0' && /[0-9]/.test(token)) {
    return token;
  }

  return `${current}${token}`;
}
