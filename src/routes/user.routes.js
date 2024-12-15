const express = require("express");
const router = express.Router();
const {
  generateOTP,
  verifyOTP,
  login,
  createAdminUser,
  logout,
  profile,
  uploadKYCDocument,
  userDashboard,
} = require("../controllers/user.controller.js");
const { verifyToken } = require("../utils/authHelper.js");
const Validators = require("../validators/user.validator.js");
/**
 * @swagger
 * /api/v1/users/generate-otp:
 *   post:
 *     summary: Send OTP to the provided mobile number.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobileNo:
 *                 type: string
 *                 pattern: "^\\d{10}$"
 *                 description: Mobile number must be exactly 10 digits.
 *             required:
 *               - mobileNo
 *     responses:
 *       '200':
 *         description: OTP sent successfully.
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     otp:
 *                       type: string
 *                       description: The OTP sent to the user.
 *               example:
 *                 statusCode: 200
 *                 status: "success"
 *                 msg: "OTP sent successfully!"
 *                 data:
 *                   otp: "123456"
 *       '400':
 *         description: Invalid mobile number.
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
 *                 msg: "Invalid mobile number. Mobile number must be 10 digits."
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

router.route("/generate-otp").post(Validators("validSendOTP"), generateOTP);

/**
 * @swagger
 * /api/v1/users/verify-otp:
 *   post:
 *     summary: Verify OTP for the provided mobile number.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobileNo:
 *                 type: string
 *                 pattern: "^\\d{10}$"
 *                 description: Mobile number must be exactly 10 digits.
 *               otp:
 *                 type: string
 *                 pattern: "^\\d{6}$"
 *                 description: OTP must be exactly 6 digits.
 *               referalCode:
 *                 type: string
 *                 description: Referral code for the user.
 *             required:
 *               - mobileNo
 *               - otp
 *     responses:
 *       '200':
 *         description: OTP verified successfully.
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
 *                 statusCode: 200
 *                 status: "success"
 *                 msg: "OTP verified successfully."
 *       '400':
 *         description: Invalid OTP or mobile number.
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
 *                 msg: "Invalid OTP or mobile number."
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

router.route("/verify-otp").post(Validators("validVerifyOTP"), verifyOTP);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Authenticate a user with email and password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 description: User's password.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Login successful.
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
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated user.
 *               example:
 *                 statusCode: 200
 *                 status: "success"
 *                 msg: "Login successful."
 *                 token: "your_jwt_token_here"
 *       '400':
 *         description: Invalid email or password.
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
 *                 msg: "Invalid email or password."
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

router.route("/admin/login").post(Validators("validLogin"), login);

/**
 * @swagger
 * /api/v1/users/admin/register:
 *   post:
 *     summary: Register an Admin user
 *     description: Registers an admin user with name, email, password, and mobile number.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the admin.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin's email address.
 *               password:
 *                 type: string
 *                 description: Admin's password.
 *               mobileNo:
 *                 type: string
 *                 description: Admin's mobile number, must be exactly 10 digits.
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Admin user successfully registered.
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
 *                 statusCode: 200
 *                 status: "success"
 *                 msg: "Admin user successfully registered."
 *       '400':
 *         description: Bad request, validation failed (e.g., invalid mobile number or missing fields).
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
 *                 msg: "Validation failed: Mobile number should be of 10 digits."
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
  .route("/admin/register")
  .post(Validators("validAdminRegister"), verifyToken, createAdminUser);

/**
 * @swagger
 * /api/v1/users/logout:
 *   get:
 *     summary: Logout a user
 *     description: Logs the user out by invalidating their session or JWT token.
 *     tags: [Users]
 *     responses:
 *       '200':
 *         description: Successfully logged out.
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
 *                 statusCode: 200
 *                 status: "success"
 *                 msg: "Successfully logged out."
 *       '401':
 *         description: Unauthorized, no active session or invalid token.
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
 *                 msg: "Unauthorized, no active session."
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

router.route("/logout").get(logout);

router.route("/").get(verifyToken, profile);

router.route("/").patch(Validators("validAdminRegister"), verifyToken, profile);

router.route("/upload-kyc-document").post(verifyToken, uploadKYCDocument);

router.route("/user-dashboard").get(verifyToken, userDashboard);

module.exports = router;
