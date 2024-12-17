const fs = require("fs");
const path = require("path");

// Helper function to save file to disk
const saveFile = (file, uploadDir) => {
  return new Promise((resolve, reject) => {
    const uniqueName = `${Date.now()}-${file.name}`;
    const uploadPath = path.join(uploadDir, uniqueName);

    file.mv(uploadPath, (err) => {
      if (err) reject(err);
      else resolve(uniqueName);
    });
  });
};

// Generalized file upload handler
exports.uploadFiles = async (
  files,
  allowedFields = [],
  uploadDir = "../docs/uploads"
) => {
  if (!files || Object.keys(files).length === 0) {
    throw new Error("No files uploaded");
  }

  const savedFiles = {};

  for (const field of allowedFields) {
    if (files[field]) {
      savedFiles[field] = await saveFile(files[field], uploadDir);
    } else {
      throw new Error(`Missing required file field: ${field}`);
    }
  }

  return savedFiles;
};
