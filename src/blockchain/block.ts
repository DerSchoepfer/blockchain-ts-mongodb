import sha256 from "crypto-js/sha256.js";
import { logger } from "../util/logger";
class Block {
  id: String;
  data: Object;
  created: number;
  precedingHash: String;
  hash: String;
  iterations: number;

  constructor(
    id: String,
    data: Object,
    created_on: number,
    precedingHash: String = "Genesis Block"
  ) {
    this.id = id;
    this.data = data;
    this.created = created_on;
    this.precedingHash = precedingHash;
    this.hash = this.computeHash();
    this.iterations = 0;
  }

  computeHash() {
    return sha256(
      this.id.toString() +
        this.precedingHash +
        this.created.toString() +
        JSON.stringify(this.data) +
        this.iterations
    ).toString();
  }

  proofOfWork(difficulty: number) {
    while (
      
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.iterations++;
      //logger.info(this.hash);
      this.hash = this.computeHash();
    }
  }
  reverse(s: String){
    return s.split("").reverse().join("");
}
}

export { Block };
