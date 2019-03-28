import { captureException } from "@sentry/node";
import { Send } from "../../index";
import { Notifier } from "../notifier";
import node, { BlockWithTransactions } from "../../../node";
import {
  store,
  getWatchAddresses,
  getWatchDisclosures,
  confirmPaymentDisclosure,
} from "../../../store";
import env from "../../../env";
import log from "../../../log";
import { getContributionIdFromMemo, decodeHexMemo, toBaseUnit, extractErrMessage } from "../../../util";

interface ContributionConfirmationPayload {
  to: string;
  amount: string;
  txid: string;
  memo: string;
  contributionId: number;
}

export default class ContributionNotifier implements Notifier {
  private send: Send = () => null;
  private confirmedTxIds: string[] = [];

  onNewBlock = (block: BlockWithTransactions) => {
    this.checkBlockForTransparentPayments(block);
    // NOTE: Re-enable when sapling is ready
    // this.checkForMemoPayments();
    // this.checkDisclosuresForPayment(block);
  };

  registerSend = (sm: Send) => (this.send = sm);

  private checkBlockForTransparentPayments = (block: BlockWithTransactions) => {
    const addresses = getWatchAddresses(store.getState());
    const tAddressIdMap = Object.entries(addresses).reduce((prev, [cid, cAddresses]) => {
      prev[cAddresses.transparent] = parseInt(cid, 10);
      return prev;
    }, {} as { [address: string]: number });

    block.tx.forEach(tx => {
      tx.vout.forEach(vout => {
        // Some vouts are not transactions with addresses, ignore those
        if (!vout.scriptPubKey.addresses) {
          return;
        }

        // Addresses is an array because of multisigs, but we'll never
        // generate one, so all of our addresses will only have addresses[0]
        const to = vout.scriptPubKey.addresses[0];
        if (tAddressIdMap[to]) {
          this.sendContributionConfirmation({
            to,
            amount: vout.valueZat.toString(),
            txid: tx.txid,
            contributionId: tAddressIdMap[to],
            // T-address transactions don't have memos
            memo: '',
          });
        }
      });
    });
  };


  private checkForMemoPayments = async () => {
    try {
      const received = await node.z_listreceivedbyaddress(
        env.SPROUT_ADDRESS,
        parseInt(env.MINIMUM_BLOCK_CONFIRMATIONS, 10),
      );
      const newReceived = received.filter(r => !this.confirmedTxIds.includes(r.txid));

      newReceived.forEach(receipt => {
        log.info(`Received new tx ${receipt.txid}`);
        this.confirmedTxIds.push(receipt.txid);
        const contributionId = getContributionIdFromMemo(receipt.memo);
        if (!contributionId) {
          log.warn(`Sprout address ${env.SPROUT_ADDRESS} received transaction with invalid memo:\n`, {
            txid: receipt.txid,
            decodedMemo: decodeHexMemo(receipt.memo)
          });
          return;
        }

        this.sendContributionConfirmation({
          to: env.SPROUT_ADDRESS,
          amount: toBaseUnit(receipt.amount).toString(),
          txid: receipt.txid,
          memo: decodeHexMemo(receipt.memo),
          contributionId,
        });
      });
    } catch(err) {
      captureException(err);
      log.error(
        'Failed to check sprout address for memo payments:\n',
        extractErrMessage(err),
      );
    }
  };

  private checkDisclosuresForPayment = (block: BlockWithTransactions) => {
    const disclosures = getWatchDisclosures(store.getState());
    Object.entries(disclosures).forEach(([cid, disclosure]) => {
      this.checkDisclosureForPayment(disclosure, parseInt(cid, 10), block.height);
    });
  };

  private checkDisclosureForPayment = async (
    disclosure: string,
    contributionId: number,
    maxHeight: number,
  ) => {
    try {
      const receipt = await node.z_validatepaymentdisclosure(disclosure);
      if (!receipt.valid) {
        log.warn('Invalid disclosure checked:', receipt);
        return;
      }
      const tx = await node.gettransaction(receipt.txid);
      const block = await node.getblock(tx.blockhash);
      if (block.height > maxHeight) {
        log.info(`Validated disclosure, will confirm in ${block.height - maxHeight} block(s)`);
        return;
      }
      log.info('Confirming disclosure:', receipt.paymentAddress);
      this.sendContributionConfirmation({
        to: receipt.paymentAddress,
        amount: receipt.value.toString(),
        txid: receipt.txid,
        memo: decodeHexMemo(receipt.memo),
        contributionId,
      });
      store.dispatch(confirmPaymentDisclosure(contributionId, disclosure));
    } catch(err) {
      captureException(err);
      log.warn(
        'Encountered an error while checking disclosure:\n',
        extractErrMessage(err),
      );
    }
  };

  private sendContributionConfirmation = (p: ContributionConfirmationPayload) => {
    log.info(`Contribution confirmed for contribution ${p.contributionId}, +${p.amount} ZEC`);
    this.send(`/proposals/contribution/${p.contributionId}/confirm`, 'POST', p);
  };
}
