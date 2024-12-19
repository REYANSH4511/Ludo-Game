const User = require("../models/user.model");
const Transaction = require("../models/transaction.model");


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

module.exports = { updateTransactionForStartingGame };
