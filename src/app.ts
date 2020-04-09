import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as cors from 'cors';
import initializePassport from './middleware/passport';
import { auth, users, teams, fields, matches } from './routes';

const app = express();
const port = process.env.PORT || 6969;

app.use(cors());

app.get('/', (req, res) => res.send('Hello World!'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

initializePassport();

mongoose.connect('mongodb+srv://dbUser:CSWF@voetbalverenigingdb-mtjqd.mongodb.net/test?retryWrites=true&w=majority', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.use('/api', auth, users, teams, fields, matches);

app.use((error, req, res, next) => {
  res.json({ error: error.message });
});

app.listen(port, () => console.log(`Listening on port ${port}`));

export default app;
