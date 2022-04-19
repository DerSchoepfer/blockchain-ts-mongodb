import { logger } from "../util/logger";
import mongoose from "mongoose";
import {
  Block as BlockModel,
  IBlock as BlockModelInterface,
} from "../models/block";
import { Block } from "./block";

class Blockchain {
  difficulty: number;

  constructor() {
    this.difficulty = 2;
  }

  async initialize() {
    //Create the GenesisBlock if not exists
    let genesisBlockInfo = await this.getGenesisBlock();
    if (!genesisBlockInfo) {
      logger.info("Initializing Genesis block . . .");
      let genesisBlockInfo = await this.createGenesisBlock();
      logger.info(`Genesis block: ${genesisBlockInfo.id}`);
    } else {
      logger.debug(`Existing Genesis block: ${genesisBlockInfo.id}`);
    }
  }
  async createGenesisBlock() {
    let id = new mongoose.Types.ObjectId().toHexString();
    let timestamp: number = new Date().getTime();
    let newblockInfo = new Block(id, { GenesisBlock: true }, timestamp);
    return await this.addNewBlock(newblockInfo);
  }

  async createTransaction(payload: Object) {
    let precedingBlockInfo = await this.getPrecedingBlock();
    if (precedingBlockInfo) {
      let id = new mongoose.Types.ObjectId().toHexString();
      let currentBlockInfo = new Block(
        id,
        payload,
        new Date().getTime(),
        precedingBlockInfo.hash
      );
      return await this.addNewBlock(currentBlockInfo);
    }
    return false;
  }

  async addNewBlock(blockObj: Block) {
    blockObj.proofOfWork(this.difficulty);
    return this.addBlockToChain(blockObj);
  }

  async addBlockToChain(blockInfo: BlockModelInterface) {
    let chainInfo = BlockModel.build(blockInfo);
    let chainEntry = await chainInfo.save();
    return chainEntry;
  }

  async getGenesisBlock() {
    let blockInfo = await BlockModel.find().sort({ $natural: 1 }).limit(1);
    return blockInfo.length > 0 ? blockInfo[0] : null;
  }

  async getPrecedingBlock() {
    let blockInfo = await BlockModel.find().sort({ $natural: -1 }).limit(1);
    return blockInfo.length > 0 ? blockInfo[0] : null;
  }

  async checkChainValidity() {
    let promise = new Promise((resolve) => {
      let previousBlock: Block;
      let currentBlock: Block;
      let idx = 1;

      BlockModel.find({})
        .sort({ $natural: 1 })
        .cursor()
        .on("data", (data) => {
          logger.info(`Validating Block(${idx}): ${data.id}`);

          if (previousBlock) {
            // recreate the block with the info from database
            currentBlock = new Block(
              data.id,
              data.data,
              data.created,
              data.precedingHash
            );
            currentBlock.proofOfWork(this.difficulty);
            // validate computed block hash with database hash entry
            if (data.hash !== currentBlock.hash) {
              logger.error(
                `Stored hash(${data.hash}) and computed hash(${currentBlock.hash}) doesn't match`
              );
              process.exit(0);
            } else {
              logger.debug(
                `Block Computed Hash Validated: ${currentBlock.id} -> SUCCESS`
              );
            }

            // validate chain block with preceding hash
            if (currentBlock.precedingHash !== previousBlock.hash) {
              logger.error(
                `Previous block hash(${previousBlock.hash}) and preceding block hash(${currentBlock.precedingHash}) doesn't match`
              );
              process.exit(0);
            } else {
              logger.debug(
                `Block Preceding Hash Chain Validated: ${currentBlock.id} -> SUCCESS`
              );
            }

            // assign current block as previous block for the next cycle
            previousBlock = Object.assign({}, currentBlock);
            idx++;
          } else {
            logger.info(`Genesis Block(${idx}): ${data.id}`);
            previousBlock = new Block(
              data.id,
              data.data,
              data.created,
              data.precedingHash
            );
            previousBlock.proofOfWork(this.difficulty);
            idx++;
          }
        })
        .on("end", function () {
          resolve(true);
        });
    });

    return promise;
  }
}
export { Blockchain };
