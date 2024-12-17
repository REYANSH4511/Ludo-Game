const Joi = require("joi");
const { errorHandler } = require("../utils/responseHandler");

const bankAccountDetailsSchema = Joi.object({
  bankName: Joi.string().required(),
  accountNumber: Joi.string().required(),
  ifscCode: Joi.string().required(),
});

const userDetailsSchema = Joi.object({
  name: Joi.string().required(),
  mobileNo: Joi.string().required(),
});

const Validators = {
  validTransactionEntry: Joi.object({
    userDetails: userDetailsSchema.required(),
    type: Joi.string().valid("deposit", "withdraw").required(),
    utrNo: Joi.string(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid("upi", "bankAccount").required(),
    upiId: Joi.when("paymentMethod", {
      is: "upi",
      then: Joi.string().required().messages({
        "any.required": "UPI ID is required when paymentMethod is 'upi'.",
      }),
      otherwise: Joi.forbidden(),
    }),
    bankAccountDetails: Joi.when("paymentMethod", {
      is: "bankAccount",
      then: bankAccountDetailsSchema.required().messages({
        "any.required":
          "Bank Account Details are required when paymentMethod is 'bankAccount'.",
      }),
      otherwise: Joi.forbidden(),
    }),
    screenShot: Joi.string().optional(),
  }),
  validTransactionResponseByAdmin: Joi.object({
    transactionId: Joi.string().required(),
    isApproved: Joi.boolean().required(),
  }),
};

module.exports = Validators;

function Validator(func) {
  return async function Validator(req, res, next) {
    try {
      const validated = await Validators[func].validateAsync(req.body, {
        abortEarly: false,
      });
      req.body = validated;
      next();
    } catch (err) {
      let _er = {};
      if (err.isJoi) {
        err.details.forEach((d) => {
          let _key = d.context.key;
          _er[_key] = d.message;
        });
      }
      await next(
        errorHandler({
          res,
          statusCode: 400,
          message: _er,
        })
      );
    }
  };
}

module.exports = Validator;
