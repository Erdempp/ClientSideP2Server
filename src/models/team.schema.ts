import * as mongoose from 'mongoose';
import { UserInterface } from './user.schema';

export interface TeamInterface {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  city: string;
  coach: UserInterface;
  players?: UserInterface[];
  gender: 'men' | 'women' | 'mixed';
  description: string;
}

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  gender: { type: String, enum: ['men', 'women', 'mixed'], required: true },
  description: { type: String, required: true },
});

export default mongoose.model<TeamInterface & mongoose.Document>(
  'team',
  TeamSchema,
);
