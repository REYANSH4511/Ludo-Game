const cron = require("node-cron");
const { updateBattleResult } = require("./cronHelper");

// Example 1: Run every minute
cron.schedule("* * * * *", updateBattleResult);
