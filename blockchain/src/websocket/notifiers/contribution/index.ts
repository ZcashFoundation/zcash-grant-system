import { Send, Message } from "../../index";
import { Notifier } from "../notifier";
import node, { BlockWithTransactions } from "../../../node";
import {
  store,
  getWatchAddresses,
  getWatchDisclosures,
  confirmPaymentDisclosure,
} from "../../../store";
import env from "../../../env";
import { dedupeArray, getContributionIdFromMemo, decodeHexMemo, toBaseUnit } from "../../../util";

interface ContributionConfirmationPayload {
  to: string;
  amount: string;
  txid: string;
  memo: string;
}

export default class ContributionNotifier implements Notifier {
  private send: Send = () => null;
  private confirmedTxIds: string[] = [];

  onNewBlock = (block: BlockWithTransactions) => {
    const state = store.getState();
    const addresses = getWatchAddresses(state);
    const disclosures = getWatchDisclosures(state);
    const tAddresses = dedupeArray(addresses.map(addrs => addrs.transparent));

    this.checkBlockForTransparentPayments(block, tAddresses);
    this.checkForMemoPayments();
    disclosures.forEach(d => this.checkDisclosureForPayment(d, block.height));
  };

  registerSend = (sm: Send) => (this.send = sm);

  private checkBlockForTransparentPayments = (
    block: BlockWithTransactions,
    addresses: string[]
  ) => {
    console.info(`Block ${block.height} has ${block.tx.length} transactions`);
    block.tx.forEach(tx => {
      tx.vout.forEach(vout => {
        // Addresses is an array because of multisigs, but we'll never
        // generate one, so all of our addresses will only have addresses[0]
        const to = vout.scriptPubKey.addresses[0];
        if (addresses.includes(to)) {
          console.info(`Transaction found: ${to} +${vout.value}`);
          this.sendContributionConfirmation({
            to,
            amount: vout.valueZat.toString(),
            txid: tx.txid,
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
        this.confirmedTxIds.push(receipt.txid);
        const contributionId = getContributionIdFromMemo(receipt.memo);
        if (!contributionId) {
          console.warn('Sprout address received transaction without memo:\n', {
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
        });
      });
    } catch(err) {
      console.error(
        'Failed to check sprout address for memo payments:\n',
        err.response ? err.response.data : err,
      );
    }
  };

  private checkDisclosureForPayment = async (disclosure: string, maxHeight: number) => {
    try {
      const receipt = await node.z_validatepaymentdisclosure(disclosure);
      if (!receipt.valid) {
        console.warn('Invalid disclosure checked:', receipt);
        return;
      }
      const tx = await node.gettransaction(receipt.txid);
      const block = await node.getblock(tx.blockhash);
      if (block.height > maxHeight) {
        console.info(`Validated disclosure, will confirm in ${block.height - maxHeight} block(s)`);
        return;
      }
      console.info('Confirming disclosure:', receipt.paymentAddress);
      this.sendContributionConfirmation({
        to: receipt.paymentAddress,
        amount: receipt.value.toString(),
        txid: receipt.txid,
        memo: decodeHexMemo(receipt.memo),
      });
      store.dispatch(confirmPaymentDisclosure(disclosure));
    } catch(err) {
      console.error(
        'Encountered an error while checking disclosure:',
        err.response ? err.response.data : err,
      );
    }
  };

  private sendContributionConfirmation = (payload: ContributionConfirmationPayload) => {
    this.send({
      payload,
      type: 'contribution:confirmation',
    });
  };
}
