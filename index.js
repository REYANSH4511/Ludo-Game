require("dotenv").config();
const express = require("express");

const cors = require("cors");
const bodyParser = require("body-parser");
const { connectDB } = require("./dbConnection");
const app = express();
const userRouter = require("./src/routes/user.routes");
const transactionRouter = require("./src/routes/transactions.routes");
const specs = require("./src/docs/swagger");
const PORT = process.env.PORT || 8000;
const swaggerUi = require("swagger-ui-express");
app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/transaction", transactionRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
