export default {
  hadError: false,
  error(line: number, message: string) {
    report(line, "", message);
  },
};

function report(line: number, where: string, message: string) {
  console.error(`[line ${line}] Error${where}: ${message}`);
}
