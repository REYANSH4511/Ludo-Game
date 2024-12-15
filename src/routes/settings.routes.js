const express = require("express");
const { verifyToken } = require("../utils/authHelper");
const { updateSocialMediaLinks } = require("../controllers/settingsController");
const Validator = require("../validators/settings.validators");
const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/update-social-media-links:
 *   patch:
 *     summary: Update social media links
 *     description: Allows an admin to update the social media links, such as WhatsApp, Facebook, Instagram, and Telegram.
 *     tags: [Admin/settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               whatsAppLink:
 *                 type: string
 *                 description: The WhatsApp link.
 *                 example: "https://wa.me/123456789"
 *               facebookLink:
 *                 type: string
 *                 description: The Facebook profile or page link.
 *                 example: "https://www.facebook.com/example"
 *               instagramLink:
 *                 type: string
 *                 description: The Instagram profile link.
 *                 example: "https://www.instagram.com/example"
 *               telegramLink:
 *                 type: string
 *                 description: The Telegram profile or group link.
 *                 example: "https://t.me/example"
 *     responses:
 *       '200':
 *         description: Social media links successfully updated.
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
 *                 msg: "Social media links updated successfully."
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
  .route("/update-social-media-links")
  .patch(
    Validator("validSocialMediaLinks"),
    verifyToken,
    updateSocialMediaLinks
  );

/**
 * @swagger
 * /api/v1/admin/upadate-referral-amount-percentage:
 *   patch:
 *     summary: Update referral amount percentage
 *     description: Allows an admin to update the referral amount percentage.
 *     tags: [Admin/settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referralAmountPercentage:
 *                 type: number
 *                 description: The new referral amount percentage to be set.
 *                 example: 15
 *     responses:
 *       '200':
 *         description: Referral amount percentage successfully updated.
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
 *                 msg: "Referral amount percentage updated successfully."
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
  .route("/upadate-referral-amount-percentage")
  .patch(
    Validator("validUpdateReferralAmountPercentage"),
    verifyToken,
    updateSocialMediaLinks
  );

module.exports = router;
