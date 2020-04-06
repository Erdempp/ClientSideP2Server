import * as mongoose from 'mongoose';
import { TeamInterface } from './team.schema';
import { FieldInterface } from './field.schema';

export interface MatchInterface {
  _id: mongoose.Schema.Types.ObjectId;
  homeTeam: TeamInterface;
  awayTeam: TeamInterface;
  field: FieldInterface;
  startDateTime: Date;
  endDateTime: Date;
}

const MatchSchema = new mongoose.Schema({
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'team', required: true },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'team', required: true },
  field: { type: mongoose.Schema.Types.ObjectId, ref: 'field', required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
});

export default mongoose.model<MatchInterface & mongoose.Document>('match', MatchSchema);
