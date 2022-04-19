import mongoose from "mongoose";
interface IBlock {
  id: String;
  data: Object;
  created: number;
  precedingHash: String;
  hash: String;
  iterations: number;
}
interface BlockModelInterface extends mongoose.Model<any> {
  build(attr: IBlock): any;
}

const blockSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    created: {
      type: Number,
      required: true,
    },
    precedingHash: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    iterations: {
      type: Number,
      required: true,
    },
  },
  { collection: "blockchain" }
);

blockSchema.statics.build = (attr: IBlock) => {
  return new Block(attr);
};

const Block = mongoose.model<any, BlockModelInterface>("Block", blockSchema);

export { Block, IBlock };
