import Match, { MatchInterface } from '../models/match.schema';

export class MatchService {
  async create(match: Omit<MatchInterface, '_id'>) {
    const newMatch = await Match.create(match);
    return newMatch ? newMatch : undefined;
  }

  async getAll() {
    const matches = await Match.find()
      .populate('homeTeam')
      .populate('awayTeam')
      .populate('field');
    return matches;
  }

  async get(id: MatchInterface['_id']) {
    const match = await Match.findOne({ _id: id })
      .populate('homeTeam')
      .populate('awayTeam')
      .populate('field');
    return match ? match : undefined;
  }

  async update(id: MatchInterface['_id'], changes: Partial<MatchInterface>) {
    const match = await Match.findByIdAndUpdate(id, changes, { new: true });
    return match ? match : undefined;
  }

  async remove(id: MatchInterface['_id']) {
    await Match.findByIdAndDelete(id);
  }
}
