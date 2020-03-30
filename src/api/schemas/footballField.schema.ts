import * as mongoose from 'mongoose';
import { UserInterface } from './user.schema';

export interface FootballFieldInterface extends mongoose.Document {
  name: string;
  contacts: UserInterface[];
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

const FootballFieldSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
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

export default mongoose.model<FootballFieldInterface>('footballfield', FootballFieldSchema);
