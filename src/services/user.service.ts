import User, { UserInterface } from '../models/user.schema';

export class UserService {
  async getAll() {
    const users = await User.find().select('-password');
    return users;
  }

  async getById(id: UserInterface['_id']) {
    const user = await User.findById(id).select('-password');
    return user ? user : undefined;
  }

  async getByEmail(email: UserInterface['email']) {
    const user = await User.findOne({ email });
    return user ? user : undefined;
  }
}
