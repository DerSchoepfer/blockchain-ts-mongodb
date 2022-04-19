import mongoose from "mongoose";
import { Blockchain } from "./blockchain/blockchain";
import { logger } from "./util/logger";

//Mongo Version 4.4.8
//MongoDB Server Settings
const mongo = {
  user: "MongoUser",
  password: "mySecredPassword",
  ip: "127.0.0.1",
  port: "27017",
  database: "blockchain",
};
var connectionString =
  "mongodb://" +
  mongo.user +
  ":" +
  mongo.password +
  "@" +
  mongo.ip +
  ":" +
  mongo.port +
  "/" +
  mongo.database;
mongoose.connect(connectionString, () => {
  logger.info("Connected to MongoDB");
});
mongoose.connection.on("error", (err) => {
  logger.error(err);
});
(async () => {
  let blockChain = new Blockchain();
  await blockChain.initialize();
  //Create Blocks for Testing
  for (let id = 1; id <= 2; id++) {
    let payload = {
      name: "Object with Your Data",
      info: "More Data...",
    };
    logger.info(`Create New Block . . .`);
    let transaction = await blockChain.createTransaction(payload);
    logger.info(`New Transaction: ${transaction.id}`);
  }
  let status = await blockChain.checkChainValidity();
  logger.info(`Chain Status: ${status ? "VALID" : "INVALID"}`);
  process.exit(0);
})();
