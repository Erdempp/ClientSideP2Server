import Team, { TeamInterface } from '../models/team.schema';

export class TeamService {
  async create(team: Omit<TeamInterface, '_id'>) {
    const newTeam = await Team.create(team);
    return newTeam ? newTeam : undefined;
  }

  async getAll() {
    const teams = await Team.find()
      .populate('coach', '-password')
      .populate('players', '-password');
    return teams;
  }

  async get(id: TeamInterface['_id']) {
    const team = await Team.findById(id)
      .populate('coach', '-password')
      .populate('players', '-password');
    return team ? team : undefined;
  }

  async getByCoach(coach: TeamInterface['coach']) {
    const team = await Team.findOne({ coach });
    return team ? team : undefined;
  }

  async exists(coach: TeamInterface['coach']) {
    const team = await Team.findOne({ coach });
    return team ? !!team : false;
  }

  async update(id: TeamInterface['_id'], changes: Partial<TeamInterface>) {
    const team = await Team.findByIdAndUpdate(id, changes, { new: true });
    return team ? team : undefined;
  }

  async remove(id: TeamInterface['_id']) {
    await Team.findByIdAndDelete(id);
  }
}
