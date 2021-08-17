const path = require("path");
const fs = require("fs");

const OUTPUT_DIR = "src";

class FileWriter {
  constructor(file) {
    this.handle = fs.openSync(file, "w");
  }

  println(string = "") {
    const data = string + "\n";
    fs.writeFileSync(this.handle, data, "utf-8");
  }

  close() {
    fs.closeSync(this.handle);
  }
}

defineAst(OUTPUT_DIR, "Expr", [
  "Binary   = left: Expr, operator: Token, right: Expr",
  "Grouping = expression: Expr",
  "Literal  = value: any",
  "Unary    = operator: Token, right: Expr",
]);

function defineAst(outputDir, baseName, types) {
  const fpath = path.join(outputDir, `${baseName.toLowerCase()}.ts`);
  const writer = new FileWriter(fpath);

  writer.println(`import Token from "./token";`);
  writer.println();
  writer.println(`export abstract class ${baseName} {`);
  writer.println();
  writer.println("  abstract accept<R>(visitor: Visitor<R>): R;");
  writer.println("}");
  writer.println();
  defineVisitor(writer, baseName, types);
  writer.println();

  for (const type of types) {
    const [className, fields] = type.split("=").map((s) => s.trim());
    defineType(writer, baseName, className, fields);
    writer.println();
  }
  writer.close();
}

function defineVisitor(writer, baseName, types) {
  writer.println(`export interface Visitor<R> {`);
  for (const type of types) {
    const typeName = type.split("=")[0].trim();
    writer.println(
      `  visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): R;`
    );
  }
  writer.println("}");
}

function defineType(writer, baseName, className, fieldList) {
  writer.println(`export class ${className} extends ${baseName} {`);
  const ctorFields = fieldList
    .split(",")
    .map((fieldDef) => `public readonly ${fieldDef}`)
    .join(", ");
  writer.println(`  constructor(${ctorFields}) { super(); }`);
  writer.println();
  writer.println(`  accept<R>(visitor: Visitor<R>) {`);
  writer.println(`    return visitor.visit${className}${baseName}(this);`);
  writer.println("  }");
  writer.println("}");
}
