const { default: mongoose } = require("mongoose");
const Battle = require("../models/battle.model");
const getMessage = require("../utils/message");
const { errorHandler, successHandler } = require("../utils/responseHandler");
const User = require("../models/user.model");
const {
  updateTransactionForStartingGame,
  updateWinningAmountForWinner,
} = require("../utils/battleHelper");

// create battle
exports.createBattle = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (!role === "user") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }

    const checkPlayingBattle = await Battle.findOne({
      $or: [{ createdBy: _id }, { acceptedBy: _id }],
      status: "PLAYING",
    });
    if (checkPlayingBattle) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M036"),
      });
    }
    const { amount } = req.body;

    const userDetails = await User.findOne({ _id }, { balance: 1 });

    if (userDetails?.balance?.totalBalance < amount) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M043"),
      });
    }

    const winnerAmount = amount * 2 - amount * 0.2;
    await Battle.create({ createdBy: _id, entryFee: amount, winnerAmount });

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M034"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

exports.deleteBattle = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (!role === "user") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    const { battleId } = req.params;
    const battleDetails = await Battle.findOne({ _id: battleId });
    if (battleDetails.acceptedBy || battleDetails.status !== "OPEN") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }

    await Battle.deleteOne({ _id: battleId });

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M044"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};
// battles list
exports.battlesListForAllUser = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (!role === "user")
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });

    const battles = await Battle.find(
      {
        $or: [{ status: "PLAYING" }, { status: "OPEN" }],
      },
      {
        entryFee: 1,
        winnerAmount: 1,
        roomNo: 1,
        acceptedBy: 1,
        createdBy: 1,
        status: 1,
      }
    )
      .populate("acceptedBy createdBy", { _id: 1, name: 1 })
      .sort({ createdAt: -1 });

    const openBattles = battles
      .filter((battle) => battle.status === "OPEN")
      .map((battle) => {
        const battleObj = battle.toObject();

        const isCreatedByUser =
          battleObj.createdBy._id.toString() === _id.toString();
        const isAccepted = Boolean(battleObj.acceptedBy);

        battleObj.showButton = isCreatedByUser
          ? isAccepted
            ? "accept"
            : "delete"
          : isAccepted
          ? "waiting"
          : "play";
        return battleObj;
      });

    const liveBattles = battles.filter((battle) => battle.status === "PLAYING");

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M035"),
      data: { openBattles, liveBattles },
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// send creater accept request
exports.sendCreaterAcceptRequest = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (!role === "user") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    const { battleId } = req.params;
    const checkValidRequest = await Battle.findOne({
      _id: battleId,
      status: "OPEN",
      createdBy: { $ne: _id },
    });

    if (!checkValidRequest) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M033"),
      });
    }
    const userDetails = await User.findOne({ _id }, { balance: 1 });
    if (userDetails?.balance?.totalBalance < amount) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M043"),
      });
    }
    await Battle.findOneAndUpdate(
      {
        _id: battleId,
        status: "OPEN",
        createdBy: { $ne: _id },
      },
      { acceptedBy: _id },
      { new: true }
    );

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M035"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// accept or reject request By battle creater
exports.acceptOrRejectRequestByCreater = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (!role === "user") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }

    const { battleId, status } = req.body;
    const payload = {};
    let messageCode;
    const battleDetails = await Battle.findOne({ _id: battleId });
    if (battleDetails.status === "PLAYING") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    if (status === "accept") {
      payload.status = "PLAYING";
      messageCode = "M038";
      const userDetails = await User.findOne({ _id }, { balance: 1 });
      if (userDetails?.balance?.totalBalance < amount) {
        return errorHandler({
          res,
          statusCode: 400,
          message: getMessage("M043"),
        });
      }
      await updateTransactionForStartingGame(battleDetails);
    } else if (status === "reject") {
      messageCode = "M039";
      payload.acceptedBy = null;
    }
    await Battle.findOneAndUpdate({ _id: battleId, createdBy: _id }, payload, {
      new: true,
    });

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage(messageCode),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// enter room number by battle creater
exports.enterRoomNumber = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (!role === "user") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    const { roomNumber, battleId } = req.body;

    const checkCorrectUser = await Battle.findOne({
      createdBy: _id,
      _id: battleId,
    });
    if (!checkCorrectUser) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    await Battle.findOneAndUpdate(
      { createdBy: _id, _id: battleId, status: "OPEN" },
      { roomNo: roomNumber },
      { new: true }
    );
    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M037"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

//battle details
exports.battleDetails = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (!role === "user") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    const { battleId } = req.params;
    const battleDetails = await Battle.findOne({ _id: battleId });
    if (!battleDetails) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M041"),
      });
    }
    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M040"),
      data: battleDetails,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// battle list for admin
exports.battleListAdmin = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    const battleList = await Battle.find({}).sort({ createdAt: -1 });

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M035"),
      data: battleList,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// update final result
exports.updateBattleResultByUser = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== "user") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }

    const { battleId, matchStatus, screenShot, cancellationReason } = req.body;
    const battleDetails = await Battle.findById(battleId);

    if (!battleDetails) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M041"),
      });
    }
    if (battleDetails?.matchStatus !== "PLAYING") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M048"),
      });
    }
    const isAcceptedUser =
      battleDetails.acceptedBy.toString() === _id.toString();
    const isCreatedUser = battleDetails.createdBy.toString() === _id.toString();

    if (!isAcceptedUser && !isCreatedUser) {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M015"),
      });
    }

    const userKey = isAcceptedUser ? "acceptedUser" : "createdUser";

    if (battleDetails.resultUpatedBy[userKey]?.matchStatus) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M048"),
      });
    }

    // Update match result for the user
    let updatedMatchResult = { matchStatus, screenShot };
    if (cancellationReason) {
      updatedMatchResult.cancellationReason = cancellationReason;
    }
    battleDetails.resultUpatedBy[userKey] = updatedMatchResult;

    await battleDetails.save();

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M047"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// update final result by admin
exports.updateBattleResultByAdmin = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (role !== "admin") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }

    const { battleId, winner, loser } = req.body;
    const battleDetails = await Battle.findById(battleId);

    if (!battleDetails) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M041"),
      });
    }

    if (battleDetails?.matchStatus !== "PLAYING") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M048"),
      });
    }

    // Update match result for the user
    battleDetails.matchStatus = "COMPLETED";
    battleDetails.winner = winner;
    battleDetails.loser = loser;
    battleDetails.status = "CLOSED";
    battleDetails.paymentStatus = "COMPLETED";
    await updateWinningAmountForWinner(battleDetails);
    await battleDetails.save();

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M047"),
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

// battle list for user
exports.battleHistory = async (req, res) => {
  try {
    const { _id, role } = req.user;
    if (!role === "user") {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    const battleList = await Battle.find({
      $or: [{ acceptedBy: _id }, { createdBy: _id }],
    })
      .populate("acceptedBy createdBy", { _id: 1, name: 1 })
      .sort({ createdAt: -1 });
    const updatedBattleList = battleList.map((item) => ({
      ...item.toObject(),
      winStatus: item?.winner
        ? item?.winner?._id.toString() === _id.toString()
          ? "WIN"
          : "LOSE"
        : "PENDING",

      againstUser:
        _id.toString() === item?.createdBy?._id?.toString()
          ? item?.acceptedBy
          : item?.createdBy,
    }));
    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M035"),
      data: updatedBattleList,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};
