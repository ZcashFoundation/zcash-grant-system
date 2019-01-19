import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'http';
import cors from 'cors';
import { captureException } from "@sentry/node";
import authMiddleware from './middleware/auth';
import errorHandlerMiddleware from './middleware/errorHandler';
import {
  store,
  generateAddresses,
  getAddressesByContributionId,
  addPaymentDisclosure,
} from '../store';
import env from '../env';
import node from '../node';
import { makeContributionMemo } from '../util';
import log from '../log';

// Configure server
const app = express();
app.set('port', env.PORT);
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
  res.json({
    data: {
      ...addresses,
      memo: makeContributionMemo(contributionId),
    },
  });
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
      log.warn('Invalid payment disclosure provided:', receipt);
      return res.status(400).json({ error: 'Payment disclosure is invalid' });
    }
  } catch(err) {
    captureException(err);
    // -8 seems to be the "invalid disclosure hex" catch-all code
    if (err.response && err.response.data && err.response.data.error.code === -8) {
      return res.status(400).json({ error: err.response.data.error.message });
    }
    else {
      log.error('Unknown node error:', err.response ? err.response.data : err);
      return res.status(500).json({ error: 'Unknown zcash node error' });
    }
  }
});

// Error handler after all routes to catch thrown exceptions
app.use(errorHandlerMiddleware);

// Exports
let server: Server;

export function start() {
  return new Promise(resolve => {
    server = app.listen(env.PORT, () => {
      log.info(`REST server started on port ${env.PORT}`);
      resolve();
    });
  });
}

export function exit() {
  if (server) {
    server.close();
    log.info('REST server has been closed');
  }
}
