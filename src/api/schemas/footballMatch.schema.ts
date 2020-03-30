import * as mongoose from 'mongoose';
import { FootballTeamInterface } from './footballTeam.schema';
import { FootballFieldInterface } from './footballField.schema';

export interface FootballMatchInterface extends mongoose.Document {
  homeTeam: FootballTeamInterface;
  awayTeam: FootballTeamInterface;
  field: FootballFieldInterface;
  startDateTime: Date;
  endDateTime: Date;
}

const FootballMatchSchema = new mongoose.Schema({
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'footballteam', required: true },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'footballteam', required: true },
  field: { type: mongoose.Schema.Types.ObjectId, ref: 'footballfield', required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
});

export default mongoose.model<FootballMatchInterface>('footballteam', FootballMatchSchema);
