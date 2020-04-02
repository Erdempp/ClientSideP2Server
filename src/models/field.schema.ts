import * as mongoose from 'mongoose';
import { UserInterface } from './user.schema';

export interface FieldInterface extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  owner: UserInterface;
  location: {
    address: string;
    number: string;
    zip: string;
  };
  facilities: string[];
  length: number;
  width: number;
  description: string;
}

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  location: {
    address: { type: String, required: true },
    number: { type: String, required: true },
    zip: { type: String, required: true },
  },
  facilities: [String],
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  description: { type: String, required: true },
});

export default mongoose.model<FieldInterface>('field', FieldSchema);
