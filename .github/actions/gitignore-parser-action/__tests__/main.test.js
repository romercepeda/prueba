describe("main", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("reports results via core.setOutput on success", async () => {
    jest.mock("@actions/core");
    jest.mock("../lib/gradeLearner");
    const core = require("@actions/core");
    const gradeLearner = require("../lib/gradeLearner");
    const fakeResults = { reports: [{ isCorrect: true }] };
    gradeLearner.mockReturnValue(fakeResults);

    require("../main");
    await new Promise(process.nextTick);

    expect(core.setOutput).toHaveBeenCalledWith("reports", fakeResults);
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  test("calls core.setFailed when gradeLearner throws", async () => {
    jest.mock("@actions/core");
    jest.mock("../lib/gradeLearner");
    const core = require("@actions/core");
    const gradeLearner = require("../lib/gradeLearner");
    const error = new Error("boom");
    gradeLearner.mockImplementation(() => {
      throw error;
    });

    require("../main");
    await new Promise(process.nextTick);

    expect(core.setFailed).toHaveBeenCalledWith(error);
    expect(core.setOutput).not.toHaveBeenCalled();
  });
});
