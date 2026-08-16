const fs = require("fs");
const os = require("os");
const path = require("path");

const gradeLearner = require("../lib/gradeLearner");

describe("gradeLearner", () => {
  let workspace;

  beforeEach(() => {
    workspace = fs.mkdtempSync(path.join(os.tmpdir(), "gitignore-test-"));
    process.env.GITHUB_WORKSPACE = workspace;
  });

  afterEach(() => {
    fs.rmSync(workspace, { recursive: true, force: true });
    delete process.env.GITHUB_WORKSPACE;
  });

  function writeGitignore(contents) {
    fs.writeFileSync(path.join(workspace, ".gitignore"), contents);
  }

  test("passes when all required entries are present", () => {
    writeGitignore(["z*", ".env", "/artifacts/"].join("\n"));

    const result = gradeLearner();

    expect(result.reports[0].isCorrect).toBe(true);
    expect(result.reports[0].level).toBe("info");
  });

  test("passes when required entries are mixed with comments and blank lines", () => {
    writeGitignore(
      ["# ignore secrets", "", ".env", "z*", "", "/artifacts/", "node_modules/"].join("\n")
    );

    const result = gradeLearner();

    expect(result.reports[0].isCorrect).toBe(true);
  });

  test("reports a single missing entry", () => {
    writeGitignore(["z*", "/artifacts/"].join("\n"));

    const result = gradeLearner();

    expect(result.reports[0].isCorrect).toBe(false);
    expect(result.reports[0].error.got).toBe("You are missing .env");
  });

  test("reports all missing entries when the file is empty", () => {
    writeGitignore("");

    const result = gradeLearner();

    expect(result.reports[0].isCorrect).toBe(false);
    expect(result.reports[0].error.got).toBe("You are missing z*,.env,/artifacts/");
  });

  test("does not break on duplicate entries", () => {
    writeGitignore(["z*", "z*", ".env", "/artifacts/"].join("\n"));

    const result = gradeLearner();

    expect(result.reports[0].isCorrect).toBe(true);
  });

  test("treats trailing whitespace on a line as not matching (regression guard)", () => {
    writeGitignore(["z*", ".env ", "/artifacts/"].join("\n"));

    const result = gradeLearner();

    expect(result.reports[0].isCorrect).toBe(false);
    expect(result.reports[0].error.got).toBe("You are missing .env");
  });

  test("treats CRLF line endings as not matching (regression guard)", () => {
    writeGitignore(["z*", ".env", "/artifacts/"].join("\r\n"));

    const result = gradeLearner();

    expect(result.reports[0].isCorrect).toBe(false);
    expect(result.reports[0].error.got).toBe("You are missing z*,.env");
  });

  test("throws when the .gitignore file does not exist", () => {
    expect(() => gradeLearner()).toThrow();
  });
});
