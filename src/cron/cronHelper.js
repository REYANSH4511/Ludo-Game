const Battle = require("../models/battle.model");
const { updateWinningAmountForWinner } = require("../utils/battleHelper");

exports.updateBattleResult = async () => {
  try {
    const battles = await Battle.find({ status: "PLAYING" });
    if (battles.length > 0) {
      for (let index = 0; index < battles.length; index++) {
        const battle = battles[index];
        if (!battle.winner || !battle.loser) {
          if (
            battle?.resultUpatedBy?.acceptedUser?.matchStatus &&
            battle?.resultUpatedBy?.createdUser?.matchStatus
          ) {
            if (
              battle?.resultUpatedBy?.acceptedUser?.matchStatus === "WON" &&
              battle?.resultUpatedBy?.createdUser?.matchStatus === "LOSS"
            ) {
              battle.winner = battle?.resultUpatedBy?.acceptedUser?._id;
              battle.loser = battle?.resultUpatedBy?.createdUser?._id;
            } else if (
              battle?.resultUpatedBy?.acceptedUser?.matchStatus === "LOSS" &&
              battle?.resultUpatedBy?.createdUser?.matchStatus === "WON"
            ) {
              battle.loser = battle?.resultUpatedBy?.acceptedUser?._id;
              battle.winner = battle?.resultUpatedBy?.createdUser?._id;
            }
            battle.matchStatus = "COMPLETED";
            battle.paymentStatus = "COMPLETED";
            battle.status = "CLOSED";
            updateWinningAmountForWinner(battle);
            await battle.save();
          }
        }
        console.log("battle", battle);
      }
    }
  } catch (err) {
    console.log(err);
  }
};
