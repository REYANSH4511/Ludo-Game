const { default: mongoose } = require("mongoose");
const Battle = require("../models/battle.model");
const getMessage = require("../utils/message");
const { errorHandler, successHandler } = require("../utils/responseHandler");
const User = require("../models/user.model");
const { updateTransactionForStartingGame } = require("../utils/battleHelper");

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
    ).sort({ createdAt: -1 });
    const openBattles = battles.filter((battle) => battle.status === "OPEN");
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
    await Battle.findOneAndUpdate(
      {
        _id: battleId,
        status: "OPEN",
        createdBy: { $ne: mongoose.Types.ObjectId(_id) },
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
    const checkCorrectUser = await Battle.findOne({
      createdBy: _id,
    });
    if (!checkCorrectUser) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    const { roomNumber } = req.body;
    await Battle.findOneAndUpdate(
      { createdBy: _id, status: "OPEN" },
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

    const { battleId, matchResult, screenShot } = req.body;
    const battleDetails = await Battle.findOne({ _id: battleId });
    if (!battleDetails) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M041"),
      });
    }
  

  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};
