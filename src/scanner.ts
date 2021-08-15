import Token from "./token";
import TokenType from "./token-type";
import errors from "./errors";

const KEYWORDS = new Map<string, TokenType>([
  ["and", TokenType.AND],
  ["class", TokenType.CLASS],
  ["else", TokenType.ELSE],
  ["false", TokenType.FALSE],
  ["for", TokenType.FOR],
  ["fun", TokenType.FUN],
  ["if", TokenType.IF],
  ["nil", TokenType.NIL],
  ["or", TokenType.OR],
  ["print", TokenType.PRINT],
  ["return", TokenType.RETURN],
  ["super", TokenType.SUPER],
  ["this", TokenType.THIS],
  ["true", TokenType.TRUE],
  ["var", TokenType.VAR],
  ["while", TokenType.WHILE],
]);

export default class Scanner {
  private readonly tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 0;

  private get isAtEnd() {
    return this.current >= this.source.length;
  }

  constructor(private readonly source: string) {}

  scanTokens(): Token[] {
    while (!this.isAtEnd) {
      // We are at the beginning of the next lexeme
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }

  private scanToken() {
    const c = this.advance();
    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "/":
        const isComment = this.match("/");
        if (isComment) {
          while (this.peek() !== "\n" && !this.isAtEnd) {
            this.advance();
          }
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace
        break;
      case "\n":
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          errors.error(this.line, `Unexpected input ${c}`);
        }
        break;
    }
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.slice(this.start, this.current);
    const type = KEYWORDS.get(text) || TokenType.IDENTIFIER;

    this.addToken(type);
  }

  private number() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    const isFloat = this.peek() === "." && this.isDigit(this.peekNext());
    if (isFloat) {
      this.advance(); // Eat "."
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(
      TokenType.NUMBER,
      parseFloat(this.source.slice(this.start, this.current))
    );
  }

  private string() {
    while (this.peek() !== '"' && !this.isAtEnd) {
      if (this.peek() === "\n") {
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd) {
      errors.error(this.line, "Unterminated string");
      return;
    }

    // Eat the closing "
    this.advance();

    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private match(expected: string) {
    if (this.peek() !== expected) {
      return false;
    }

    this.advance();
    return true;
  }

  private peek() {
    if (this.isAtEnd) {
      return "\0";
    }
    return this.source[this.current];
  }

  private peekNext() {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }
    return this.source[this.current + 1];
  }

  private isAlpha(c: string) {
    return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z") || c === "_";
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isDigit(c: string) {
    return c >= "0" && c <= "9";
  }

  private advance() {
    return this.source[this.current++];
  }

  private addToken(type: TokenType, literal: any = null) {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }
}
