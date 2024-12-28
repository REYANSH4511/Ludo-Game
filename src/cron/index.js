const cron = require("node-cron");
const { updateBattleResult } = require("./cronHelper");

// Example 1: Run every minute
cron.schedule("* * * * *", async() => {
  console.log("Task running every minute:",await updateBattleResult());
});

