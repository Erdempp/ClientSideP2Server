import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';

const saltRounds = 10;

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, index: true, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
});

//UserSchema.pre bcrypt the password

const User = mongoose.model('User', UserSchema);

export default User;
