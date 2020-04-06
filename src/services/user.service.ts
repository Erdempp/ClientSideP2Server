import User, { UserInterface } from 'src/models/user.schema';

export class UserService {
  async getAll() {
    const users = await User.find();
    return users;
  }

  async getById(id: UserInterface['_id']) {
    const user = await User.findById(id);
    return user ? user : undefined;
  }
}
