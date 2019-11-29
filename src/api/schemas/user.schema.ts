import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const saltRounds = 10;

export interface UserInterface extends mongoose.Document {
  email: string;
  name: string;
  password: string;
}

export const UserSchema = new mongoose.Schema({
  email: { type: String, index: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
});

UserSchema.pre<UserInterface>('save', async function() {
  const hash = await bcrypt.hash(this.password, saltRounds);
  if (!hash) {
    throw new Error('Failed to save user');
  }
  this.password = hash;
});

export default mongoose.model<UserInterface>('user', UserSchema);
