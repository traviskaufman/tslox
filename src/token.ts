import TokenType from "./token-type";
import util from "util";

export default class Token {
  constructor(
    public readonly type: TokenType,
    public readonly lexeme: string,
    public readonly literal: any,
    public readonly line: number
  ) {}

  toString() {
    return `${TokenType[this.type]} ${this.lexeme} ${this.literal}`;
  }

  [util.inspect.custom]() {
    return `Token(type = ${TokenType[this.type]}, lexeme = '${
      this.lexeme
    }', literal = ${this.literal})`;
  }
}
