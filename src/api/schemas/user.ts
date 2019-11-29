import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const saltRounds = 10;

export interface User extends mongoose.Document {
  email: string;
  name: string;
  password: string;
}

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, index: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
});

UserSchema.pre<User>('save', async function() {
  const hash = await bcrypt.hash(this.password, saltRounds);
  if (!hash) {
    throw new Error('Failed to save user');
  }
  this.password = hash;
});

export default mongoose.model<User>('users', UserSchema);
