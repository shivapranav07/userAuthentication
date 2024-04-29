const express = require("express");
const rootRouter = require("./routes/index");
const userRouter = require("./routes/user");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use("/api/v1",rootRouter);
app.use("/api/v1/user",userRouter);

app.listen(3000);