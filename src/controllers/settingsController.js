const getMessage = require("../utils/message");
const { errorHandler, successHandler } = require("../utils/responseHandler");

exports.updateSocialMediaLinks = async (req, res) => {
  try {
    const { _id, role } = req.user;
    const { whatsAppLink, facebookLink, instagramLink, telegramLink } =
      req.body;

    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M015"),
      });
    }

    const updateObject = {
      ...(whatsAppLink && { whatsAppLink }),
      ...(facebookLink && { facebookLink }),
      ...(instagramLink && { instagramLink }),
      ...(telegramLink && { telegramLink }),
    };

    if (Object.keys(updateObject).length === 0) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M026"),
      });
    }

    const updatedSettings = await Settings.updateOne(
      {},
      { $set: updateObject }
    );

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M027"),
      data: updatedSettings,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};

exports.updateReferralAmountPercentage = async (req, res) => {
  try {
    const { _id, role } = req.user;
    const { referralAmountPercentage } = req.body;

    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 403,
        message: getMessage("M015"),
      });
    }

    const updateObject = {
      ...(referralAmountPercentage && { referralAmountPercentage }),
    };

    if (Object.keys(updateObject).length === 0) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M026"),
      });
    }

    const updatedSettings = await Settings.updateOne(
      {},
      { $set: updateObject }
    );

    return successHandler({
      res,
      statusCode: 200,
      message: getMessage("M027"),
      data: updatedSettings,
    });
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};
