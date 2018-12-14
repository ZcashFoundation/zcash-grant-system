import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'http';
import authMiddleware from './middleware/auth';
import { deriveAddress } from '../util';
import { store, generateAddress, getAddressByContributionId } from '../store';
import env from '../env';

// Configure server
const app = express();
app.set('port', env.REST_SERVER_PORT);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(authMiddleware);

// Routes
app.get('/contribution/t-address', (req, res) => {
  const { contributionId } = req.query;
  let address = getAddressByContributionId(store.getState(), contributionId);
  if (!address) {
    const action = generateAddress(req.query.contributionId);
    address = action.payload.address;
    store.dispatch(action);
  }
  res.json({ data: address });
});

app.post('/contribution/disclosure', (req, res) => {
  const { disclosure } = req.body;
  if (!disclosure) {
    return res.status(400).json({ error: 'Argument `disclosure` is required' });
  }
  // TODO: Simple check if disclosure is in right format
  return res.json({ data: 'yee' });
});

// Exports
let server: Server;

export function start() {
  return new Promise(resolve => {
    server = app.listen(env.REST_SERVER_PORT, () => {
      console.log(`REST server started on port ${env.REST_SERVER_PORT}`);
      resolve();
    });
  });
}

export function exit() {
  if (server) {
    server.close();
    console.log('REST server has been closed');
  }
}
