import fs from "fs";
import repl from "repl";
import Scanner from "./scanner";
import errors from "./errors";
import Parser from "./parser";

main(process.argv.slice(2));

function main(args: string[]) {
  if (args.length > 1) {
    console.error("Usage: tslox [script]");
    process.exit(64);
  } else if (args.length === 1) {
    runFile(args[0]);
  } else {
    runPrompt();
  }
}

function runFile(path: string) {
  const source = fs.readFileSync(path, "utf-8");
  run(source);

  if (errors.hadError) {
    process.exit(65);
  }
}

function runPrompt() {
  repl.start({
    prompt: "🥯 ",
    eval(evalCmd, _context, _file, cb) {
      if (evalCmd) {
        run(evalCmd);
        errors.hadError = false;
      }
      cb(null, undefined);
    },
  });
}

function run(source: string) {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  const expression = parser.parse();

  if (errors.hadError) {
    return;
  }

  console.log(expression);
}
