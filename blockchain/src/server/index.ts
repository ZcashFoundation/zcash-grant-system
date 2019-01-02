import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'http';
import cors from 'cors';
import authMiddleware from './middleware/auth';
import {
  store,
  generateAddresses,
  getAddressesByContributionId,
  addPaymentDisclosure,
} from '../store';
import env from '../env';
import node from '../node';

// Configure server
const app = express();
app.set('port', env.REST_SERVER_PORT);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(authMiddleware);



// Routes
app.get('/contribution/addresses', (req, res) => {
  const { contributionId } = req.query;
  let addresses = getAddressesByContributionId(store.getState(), contributionId)
  if (!addresses) {
    const action = generateAddresses(req.query.contributionId);
    addresses = action.payload.addresses;
    store.dispatch(action);
  }
  res.json({ data: addresses });
});


app.post('/contribution/disclosure', async (req, res) => {
  const { disclosure, contributionId } = req.body;
  if (!disclosure) {
    return res.status(400).json({ error: 'Argument `disclosure` is required' });
  }

  try {
    const receipt = await node.z_validatepaymentdisclosure(disclosure);
    if (receipt.valid) {
      // Add disclosure to redux. Even if validated, we won't confirm the
      // payment until it's been settled after some number of blocks. This
      // also keeps all of the confirmation code in one place.
      store.dispatch(addPaymentDisclosure(contributionId, disclosure));
      return res.status(200).json({ data: receipt });
    } else {
      console.warn('Invalid payment disclosure provided:', receipt);
      return res.status(400).json({ error: 'Payment disclosure is invalid' });
    }
  } catch(err) {
    // -8 seems to be the "invalid disclosure hex" catch-all code
    if (err.response && err.response.data && err.response.data.error.code === -8) {
      return res.status(400).json({ error: err.response.data.error.message });
    }
    else {
      console.error('Unknown node error:', err.response ? err.response.data : err);
      return res.status(500).json({ error: 'Unknown zcash node error' });
    }
  }
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
