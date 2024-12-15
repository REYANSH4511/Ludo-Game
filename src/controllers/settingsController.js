const getMessage = require("../utils/message");
const { errorHandler } = require("../utils/responseHandler");

exports.updateSocialMediaLinks = async (req, res) => {
  try {
    const { _id, role } = req.user;
    const { whatsAppLink, facebookLink, instagramLink, telegramLink } =
      req.body;
    if (role === "user") {
      return errorHandler({
        res,
        statusCode: 403,
        message: "Unauthorized",
      });
    }
    const updateObject = {};
    if (whatsAppLink) {
      updateObject.whatsAppLink = whatsAppLink;
    }
    if (facebookLink) {
      updateObject.facebookLink = facebookLink;
    }
    if (instagramLink) {
      updateObject.instagramLink = instagramLink;
    }
    if (telegramLink) {
      updateObject.telegramLink = telegramLink;
    }
    if (!whatsAppLink && !facebookLink && !instagramLink && !telegramLink) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M026"),
      });
    }
    await Settings.updateOne(
      {},
      {
        $set: {
          whatsAppLink,
          facebookLink,
          instagramLink,
          telegramLink,
        },
      }
    );
  } catch (err) {
    return errorHandler({
      res,
      statusCode: 500,
      message: err.message,
    });
  }
};
