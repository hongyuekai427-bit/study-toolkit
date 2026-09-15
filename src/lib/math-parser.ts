// Safe mathematical expression parser - no eval()
// Supports: +, -, *, /, ^, %, parentheses, functions, constants

type Token = { type: 'number' | 'operator' | 'function' | 'lparen' | 'rparen' | 'comma' | 'constant'; value: string };

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = expr.replace(/\s+/g, '');
  
  while (i < s.length) {
    // Numbers (including decimals)
    if (/[0-9.]/.test(s[i])) {
      let num = '';
      while (i < s.length && /[0-9.]/.test(s[i])) {
        num += s[i++];
      }
      tokens.push({ type: 'number', value: num });
    }
    // Constants
    else if (s.substring(i, i + 2) === 'pi' || s[i] === 'π') {
      tokens.push({ type: 'constant', value: 'pi' });
      i += s[i] === 'π' ? 1 : 2;
    }
    else if (s.substring(i, i + 1) === 'e' && (i + 1 >= s.length || !/[a-z]/i.test(s[i + 1]))) {
      tokens.push({ type: 'constant', value: 'e' });
      i += 1;
    }
    // Functions
    else if (/[a-zA-Z]/.test(s[i])) {
      let fn = '';
      while (i < s.length && /[a-zA-Z]/.test(s[i])) {
        fn += s[i++];
      }
      const knownFns = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'cbrt', 'abs', 'ceil', 'floor', 'round', 'factorial', 'fact'];
      if (knownFns.includes(fn.toLowerCase())) {
        tokens.push({ type: 'function', value: fn.toLowerCase() });
      } else {
        throw new Error(`Unknown function: ${fn}`);
      }
    }
    // Operators
    else if ('+-*/^%'.includes(s[i])) {
      tokens.push({ type: 'operator', value: s[i++] });
    }
    else if (s[i] === '(') {
      tokens.push({ type: 'lparen', value: '(' });
      i++;
    }
    else if (s[i] === ')') {
      tokens.push({ type: 'rparen', value: ')' });
      i++;
    }
    else if (s[i] === ',') {
      tokens.push({ type: 'comma', value: ',' });
      i++;
    }
    else {
      throw new Error(`Unexpected character: ${s[i]}`);
    }
  }
  return tokens;
}

class Parser {
  private tokens: Token[];
  private pos: number;
  private useDegrees: boolean;

  constructor(tokens: Token[], useDegrees: boolean) {
    this.tokens = tokens;
    this.pos = 0;
    this.useDegrees = useDegrees;
  }

  private peek(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  parse(): number {
    const result = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error('Unexpected token after expression');
    }
    return result;
  }

  private parseExpression(): number {
    let left = this.parseTerm();
    while (this.peek() && this.peek()!.type === 'operator' && '+-'.includes(this.peek()!.value)) {
      const op = this.consume().value;
      const right = this.parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  private parseTerm(): number {
    let left = this.parsePower();
    while (this.peek() && this.peek()!.type === 'operator' && '*/%'.includes(this.peek()!.value)) {
      const op = this.consume().value;
      const right = this.parsePower();
      if (op === '*') left = left * right;
      else if (op === '/') {
        if (right === 0) throw new Error('Division by zero');
        left = left / right;
      }
      else left = left % right;
    }
    return left;
  }

  private parsePower(): number {
    let base = this.parseUnary();
    if (this.peek() && this.peek()!.type === 'operator' && this.peek()!.value === '^') {
      this.consume();
      const exp = this.parseUnary();
      base = Math.pow(base, exp);
    }
    return base;
  }

  private parseUnary(): number {
    if (this.peek() && this.peek()!.type === 'operator' && this.peek()!.value === '-') {
      this.consume();
      return -this.parsePrimary();
    }
    if (this.peek() && this.peek()!.type === 'operator' && this.peek()!.value === '+') {
      this.consume();
      return this.parsePrimary();
    }
    return this.parsePrimary();
  }

  private parsePrimary(): number {
    const token = this.peek();
    if (!token) throw new Error('Unexpected end of expression');

    if (token.type === 'number') {
      this.consume();
      const val = parseFloat(token.value);
      if (isNaN(val)) throw new Error(`Invalid number: ${token.value}`);
      return val;
    }

    if (token.type === 'constant') {
      this.consume();
      if (token.value === 'pi') return Math.PI;
      if (token.value === 'e') return Math.E;
      throw new Error(`Unknown constant: ${token.value}`);
    }

    if (token.type === 'function') {
      this.consume();
      if (!this.peek() || this.peek()!.type !== 'lparen') {
        throw new Error(`Expected ( after function ${token.value}`);
      }
      this.consume(); // (
      const arg = this.parseExpression();
      if (!this.peek() || this.peek()!.type !== 'rparen') {
        throw new Error('Expected )');
      }
      this.consume(); // )
      return this.applyFunction(token.value, arg);
    }

    if (token.type === 'lparen') {
      this.consume();
      const val = this.parseExpression();
      if (!this.peek() || this.peek()!.type !== 'rparen') {
        throw new Error('Expected )');
      }
      this.consume();
      return val;
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  private applyFunction(name: string, arg: number): number {
    const toRad = (x: number) => this.useDegrees ? (x * Math.PI) / 180 : x;
    const fromRad = (x: number) => this.useDegrees ? (x * 180) / Math.PI : x;
    
    switch (name) {
      case 'sin': return Math.sin(toRad(arg));
      case 'cos': return Math.cos(toRad(arg));
      case 'tan': return Math.tan(toRad(arg));
      case 'asin': return fromRad(Math.asin(arg));
      case 'acos': return fromRad(Math.acos(arg));
      case 'atan': return fromRad(Math.atan(arg));
      case 'log': return Math.log10(arg);
      case 'ln': return Math.log(arg);
      case 'sqrt': return Math.sqrt(arg);
      case 'cbrt': return Math.cbrt(arg);
      case 'abs': return Math.abs(arg);
      case 'ceil': return Math.ceil(arg);
      case 'floor': return Math.floor(arg);
      case 'round': return Math.round(arg);
      case 'factorial':
      case 'fact':
        if (arg < 0 || !Number.isInteger(arg)) throw new Error('Factorial requires non-negative integer');
        if (arg > 170) throw new Error('Number too large for factorial');
        let result = 1;
        for (let i = 2; i <= arg; i++) result *= i;
        return result;
      default:
        throw new Error(`Unknown function: ${name}`);
    }
  }
}

export function evaluate(expr: string, useDegrees: boolean = true): number {
  if (!expr.trim()) throw new Error('Empty expression');
  const tokens = tokenize(expr);
  const parser = new Parser(tokens, useDegrees);
  return parser.parse();
}

export function formatResult(num: number): string {
  if (Number.isInteger(num)) return num.toString();
  if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-10 && num !== 0)) {
    return num.toExponential(6);
  }
  return parseFloat(num.toPrecision(12)).toString();
}

// Fraction utilities
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export interface Fraction {
  numerator: number;
  denominator: number;
}

export function simplifyFraction(f: Fraction): Fraction {
  const g = gcd(f.numerator, f.denominator);
  const num = f.numerator / g;
  const den = f.denominator / g;
  if (den < 0) return { numerator: -num, denominator: -den };
  return { numerator: num, denominator: den };
}

export function fractionToString(f: Fraction): string {
  const s = simplifyFraction(f);
  if (s.denominator === 1) return `${s.numerator}`;
  return `${s.numerator}/${s.denominator}`;
}

export function fractionToMixed(f: Fraction): string {
  const s = simplifyFraction(f);
  if (s.denominator === 1) return `${s.numerator}`;
  const whole = Math.floor(Math.abs(s.numerator) / s.denominator);
  const remainder = Math.abs(s.numerator) % s.denominator;
  if (whole === 0) return `${s.numerator}/${s.denominator}`;
  const sign = (s.numerator < 0) ? '-' : '';
  if (remainder === 0) return `${sign}${whole}`;
  return `${sign}${whole} ${remainder}/${s.denominator}`;
}

export function fractionToDecimal(f: Fraction): string {
  const s = simplifyFraction(f);
  return (s.numerator / s.denominator).toString();
}

export function addFractions(a: Fraction, b: Fraction): Fraction {
  const den = lcm(a.denominator, b.denominator);
  const num = a.numerator * (den / a.denominator) + b.numerator * (den / b.denominator);
  return simplifyFraction({ numerator: num, denominator: den });
}

export function subtractFractions(a: Fraction, b: Fraction): Fraction {
  const den = lcm(a.denominator, b.denominator);
  const num = a.numerator * (den / a.denominator) - b.numerator * (den / b.denominator);
  return simplifyFraction({ numerator: num, denominator: den });
}

export function multiplyFractions(a: Fraction, b: Fraction): Fraction {
  return simplifyFraction({
    numerator: a.numerator * b.numerator,
    denominator: a.denominator * b.denominator
  });
}

export function divideFractions(a: Fraction, b: Fraction): Fraction {
  if (b.numerator === 0) throw new Error('Cannot divide by zero');
  return multiplyFractions(a, { numerator: b.denominator, denominator: b.numerator });
}

export function parseMixedNumber(input: string): Fraction {
  const trimmed = input.trim();
  // Mixed number: "2 3/4"
  const mixedMatch = trimmed.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1]);
    const num = parseInt(mixedMatch[2]);
    const den = parseInt(mixedMatch[3]);
    if (den === 0) throw new Error('Denominator cannot be zero');
    const sign = whole < 0 ? -1 : 1;
    return { numerator: sign * (Math.abs(whole) * den + num), denominator: den };
  }
  // Simple fraction: "3/4"
  const fracMatch = trimmed.match(/^(-?\d+)\/(\d+)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1]);
    const den = parseInt(fracMatch[2]);
    if (den === 0) throw new Error('Denominator cannot be zero');
    return { numerator: num, denominator: den };
  }
  // Integer
  const intMatch = trimmed.match(/^(-?\d+)$/);
  if (intMatch) {
    return { numerator: parseInt(intMatch[1]), denominator: 1 };
  }
  throw new Error('Invalid fraction format. Use: 3/4, 2 3/4, or 5');
}
