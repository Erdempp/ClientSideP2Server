import Team, { TeamInterface } from '../models/team.schema';
import { UserInterface } from '../models/user.schema';

export class TeamService {
  async create(team: TeamInterface) {
    return await Team.create(team);
  }

  async get(id: TeamInterface['_id']) {
    return await Team.findById(id);
  }

  async getAll() {
    return await Team.find({})
      .populate('coach')
      .populate('players')
      .populate('sparePlayers');
  }

  async addPlayer(team: TeamInterface, player: UserInterface) {
    team.players.push(player);
    return await team.save();
  }

  async update(id: TeamInterface['_id'], changes: Partial<TeamInterface>) {
    return await Team.findByIdAndUpdate(id, changes);
  }

  async remove(id: TeamInterface['_id']) {
    return await Team.findByIdAndDelete(id);
  }
}
