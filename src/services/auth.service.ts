import User from '../models/user.schema';

export class AuthService {
  async create(email: string, name: string, password: string) {
    const user = await User.create(new User({ email, name, password }));
    return user ? user : undefined;
  }

  async exists(email: string) {
    const user = await User.findOne({ email });
    return user ? !!user : false;
  }
}
