import Team, { TeamInterface } from '../models/team.schema';

export class TeamService {
  async create(team: Omit<TeamInterface, '_id'>) {
    const newTeam = await Team.create(team);
    return newTeam ? newTeam : undefined;
  }

  async get(id: TeamInterface['_id']) {
    const team = await Team.findById(id);
    return team ? team : undefined;
  }

  async getAll() {
    const teams = await Team.find()
      .populate('coach')
      .populate('players')
      .populate('sparePlayers');
    return teams ? teams : undefined;
  }

  async update(id: TeamInterface['_id'], changes: Partial<TeamInterface>) {
    const team = await Team.findByIdAndUpdate(id, changes, { new: true });
    return team ? team : undefined;
  }

  async remove(id: TeamInterface['_id']) {
    await Team.findByIdAndDelete(id);
  }
}
