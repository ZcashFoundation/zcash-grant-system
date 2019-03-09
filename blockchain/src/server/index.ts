import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'http';
import cors from 'cors';
import { captureException } from "@sentry/node";
import authMiddleware from './middleware/auth';
import errorHandlerMiddleware from './middleware/errorHandler';
import {
  store,
  setStartingBlockHeight,
  generateAddresses,
  getAddressesByContributionId,
  addPaymentDisclosure,
} from '../store';
import env from '../env';
import node, { getBootstrapBlockHeight } from '../node';
import { makeContributionMemo } from '../util';
import log from '../log';

// Configure server
const app = express();
const limit = '50mb';
app.set('port', env.PORT);
app.use(cors());
app.use(bodyParser.json({ limit }));
app.use(bodyParser.urlencoded({ extended: true, limit }));
app.use(authMiddleware);

// Routes
app.post('/bootstrap', async (req, res) => {
  const { pendingContributions, latestTxId } = req.body;
  const info = await node.getblockchaininfo();
  const startHeight = await getBootstrapBlockHeight(latestTxId);

  console.info('Bootstrapping watcher!');
  console.info(' * Start height:', startHeight);
  console.info(' * Current height:', info.blocks);
  console.info(' * Number of pending contributions:', pendingContributions.length);
  console.info('Generating addresses to watch for each contribution...');

  // Running generate address on each will add each contribution to redux state
  pendingContributions.forEach((c: any) => {
    store.dispatch(generateAddresses(c.id));
  });
  console.info(`Done! Generated ${pendingContributions.length} addresses.`);
  store.dispatch(setStartingBlockHeight(startHeight));

  // Send back some basic info about where the chain is at
  res.json({
    data: {
      startHeight,
      currentHeight: info.blocks,
    },
  });
});

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

app.get('/validate/address', async (req, res) => {
  const { address } = req.query;
  const [tRes, zRes] = await Promise.all([
    node.validateaddress(address as string),
    node.z_validateaddress(address as string),
  ]);
  return res.json({
    data: {
      valid: tRes.isvalid || zRes.isvalid,
    },
  });
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
