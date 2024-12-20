const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");
const Settings = require("../models/settings.model");

//function to update withdraw transaction and total balance in schemas
const updateTransactionForStartingGame = async (data) => {
  const transactionsPayloads = [
    {
      userId: data.createdBy,
      type: "withdraw",
      amount: data.entryFee,
      status: "approved",
      isBattleTransaction: true,
    },
    {
      userId: data.acceptedBy,
      type: "withdraw",
      amount: data.entryFee,
      status: "approved",
      isBattleTransaction: true,
    },
  ];

  const userUpdates = [
    {
      filter: { _id: data.createdBy },
      update: {
        $inc: {
          "balance.totalBalance": -data.entryFee,
          "balance.battlePlayed": 1,
        },
      },
    },
    {
      filter: { _id: data.acceptedBy },
      update: {
        $inc: {
          "balance.totalBalance": -data.entryFee,
          "balance.battlePlayed": 1,
        },
      },
    },
  ];

  try {
    // Create transactions for both users
    await Promise.all(
      transactionsPayloads.map((payload) => Transaction.create(payload))
    );

    // Update users' balances and stats
    await Promise.all(
      userUpdates.map(({ filter, update }) => User.updateOne(filter, update))
    );
  } catch (error) {
    console.error("Error updating transaction or user:", error);
    throw error;
  }
};

const updateWinningAmountForWinner = async (data) => {
  try {
    const userDetails = await User.findOne({ _id: data.winner });

    userDetails.balance.totalBalance += data.winningAmount;
    userDetails.balance.cashWon += data.winningAmount;

    await userDetails.save();
    const referredUserDetails = await User.findOne({ _id: data.referredBy });

    if (referredUserDetails) {
      const settings = await Settings.findOne(
        {},
        { referralAmountPercentage: 1, _id: 0, __v: 0 }
      );
      const referralEarningPercentage = settings?.referralAmountPercentage || 0;
      const referralAmount =
        (data.winningAmount * referralEarningPercentage) / 100;
      // Add 2% of the winning amount to the referrer's referralEarning
      referredUserDetails.balance.referralEarning += referralAmount;

      // Check if the user exists in the referredUsers array
      const referredUser = referredUserDetails.referredUsers.find(
        (user) => user.userId.toString() === data.winner.toString()
      );

      if (referredUser) {
        // Update referralEarning for the user in the referredUsers array
        referredUser.referralEarning += referralAmount;

        // Save the updated referredUserDetails
        await referredUserDetails.save();
      }
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  updateTransactionForStartingGame,
  updateWinningAmountForWinner,
};
