import User, { UserInterface } from '../models/user.schema';

export class AuthService {
  async create(
    email: UserInterface['email'],
    name: UserInterface['name'],
    password: UserInterface['password'],
  ) {
    const user = await User.create(new User({ email, name, password }));
    return user ? user : undefined;
  }

  async exists(email: string) {
    const user = await User.findOne({ email });
    return user ? !!user : false;
  }
}
