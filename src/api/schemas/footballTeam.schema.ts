import mongoose from 'mongoose';
import { UserInterface } from './user.schema';

export interface FootballTeamInterface extends mongoose.Document {
  name: string;
  city: string;
  coach: UserInterface;
  players: UserInterface[];
  sparePlayers: UserInterface[];
  gender: 'men' | 'women' | 'mixed';
  description: string;
}

const FootballTeamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  sparePlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  gender: { type: String, enum: ['men', 'women', 'mixed'], required: true },
  description: { type: String, required: true },
});

export default mongoose.model<FootballTeamInterface>('footballteam', FootballTeamSchema);
