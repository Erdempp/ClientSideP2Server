import bodyParser from 'body-parser';
import express from 'express';
import UserController from './controllers/usercontroller';

const app = express();
const port = 6969;

app.get('/', (req, res) => res.send('Hello World!'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/users', UserController);

app.listen(port, () => console.log(`Listening on port ${port}`));

export default app;
