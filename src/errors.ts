import Token from "./token";
import TokenType from "./token-type";

export default {
  hadError: false,
  error(line: number | Token, message: string) {
    if (typeof line === "number") {
      report(line, "", message);
      return;
    }

    const token = line;
    if (token.type === TokenType.EOF) {
      report(token.line, " at end", message);
    } else {
      report(token.line, ` at '${token.lexeme}'`, message);
    }
  },
};

function report(line: number, where: string, message: string) {
  console.error(`[line ${line}] Error${where}: ${message}`);
}
