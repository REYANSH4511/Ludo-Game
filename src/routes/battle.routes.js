const express = require("express");
const { verifyToken } = require("../utils/authHelper");
const {
  createBattle,
  deleteBattle,
  battlesListForAllUser,
  sendCreaterAcceptRequest,
  acceptOrRejectRequestByCreater,
  enterRoomNumber,
  updateBattleResultByUser,
  updateBattleResultByAdmin,
  battleHistory,
  battleDetails,
} = require("../controllers/battle.controller");
const Validator = require("../validators/battle.validator");
const router = express.Router();

router
  .route("/create")
  .post(Validator("validCreateBattle"), verifyToken, createBattle);

router.route("/").delete(verifyToken, deleteBattle);

router.route("/").get(verifyToken, battlesListForAllUser);

router
  .route("/accept-or-reject-request-by-creater")
  .post(
    Validator("validAcceptOrRejectRequestByCreater"),
    verifyToken,
    acceptOrRejectRequestByCreater
  );

router
  .route("/enter-room-number")
  .post(Validator("validEnterRoomNumber"), verifyToken, enterRoomNumber);
router
  .route("/update-battle-result-by-user")
  .post(
    Validator("ValidUpdateBattleResultByUser"),
    verifyToken,
    updateBattleResultByUser
  );

router.route("/game-history").get(verifyToken, battleHistory);

router
  .route("/update-battle-result-by-admin")
  .post(
    Validator("ValidUpdateBattleResultByAdmin"),
    verifyToken,
    updateBattleResultByAdmin
  );

router
  .route("/send-creater-accept-request/:battleId")
  .get(verifyToken, sendCreaterAcceptRequest);

router.route("/details/:battleId").get(verifyToken, battleDetails);

module.exports = router;
