import express from 'express';
import User from '../schemas/user';
import jwt from 'jsonwebtoken';

const router = express.Router();

router
    .post('/register', async (req, res) => {
        const props = req.body;
        const { email, name, password } = props;

        if (!(email && name && password)) {
            return res.status(400).json({ message: 'One or more properties are missing' })
        }

        const user = await User.create(new User({ email, name, password }));
        if (!user) {
            return res.status(500).json(new Error('Failed to create new User'));
        }

        return res.status(201).json(user);
    })

    .post('/login', async (req, res) => {
        const props = req.body;
        const { email, password } = props;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json(new Error('Invalid username or password'));
        }

        //if bcrypt.compareSync(password, user.password);
        const token = jwt.sign({ id: user.id }, 'randomSecret', { expiresIn: '24h' })
        if (!token) {
            return res.status(500).json(new Error('Internal server error'));
        }

        return res.status(200).json({ token });
    });

export default router;
