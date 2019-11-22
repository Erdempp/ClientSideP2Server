import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import initializePassport from './middleware/passport';
import UserController from './controllers/usercontroller';
import AuthController from './controllers/authcontroller';

const app = express();
const port = 6969;

app.get('/', (req, res) => res.send('Hello World!'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

initializePassport();

mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost/voetbalvereniging', {
  useNewUrlParser: true,
});

app.use('/users', UserController);
app.use('/auth', AuthController);

app.use((error, req, res, next) => {
  res.json({ error: error.message });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

export default app;
