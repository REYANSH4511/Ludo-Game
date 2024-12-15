const express = require("express");
const router = express.Router();
const { verifyToken } = require("../utils/authHelper");
const {
  createTransaction,
  getTransactions,
  transactionResponse,
} = require("../controllers/transaction.conroller");
const { route } = require("./user.routes");
const Validator = require("../validators/transaction.validator");

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Allows the user to create a transaction, either a deposit or a withdrawal.
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount of the transaction.
 *                 example: 500
 *               type:
 *                 type: string
 *                 description: The type of transaction, either "deposit" or "withdraw".
 *                 enum: ["deposit", "withdraw"]
 *                 example: "deposit"
 *               screenShot:
 *                 type: string
 *                 description: A screenshot of the transaction as proof (optional).
 *                 example: "base64-encoded-image-data"
 *     responses:
 *       '201':
 *         description: Transaction successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                       description: The ID of the created transaction.
 *                     amount:
 *                       type: number
 *                     type:
 *                       type: string
 *                     screenShot:
 *                       type: string
 *               example:
 *                 statusCode: 201
 *                 status: "success"
 *                 data:
 *                   transactionId: "12345abc"
 *                   amount: 500
 *                   type: "deposit"
 *                   screenShot: "base64-encoded-image-data"
 *       '400':
 *         description: Bad request, invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 status:
 *                   type: string
 *                 msg:
 *                   type: string
 *               example:
 *                 statusCode: 400
 *                 status: "error"
 *                 msg: "Invalid input data."
 *       '401':
 *         description: Unauthorized, invalid or missing token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 status:
 *                   type: string
 *                 msg:
 *                   type: string
 *               example:
 *                 statusCode: 401
 *                 status: "error"
 *                 msg: "Unauthorized, invalid or missing token."
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 status:
 *                   type: string
 *                 msg:
 *                   type: string
 *               example:
 *                 statusCode: 500
 *                 status: "error"
 *                 msg: "Internal server error."
 */

router
  .route("/")
  .post(Validator("validTransactionEntry"), verifyToken, createTransaction);




module.exports = router;
