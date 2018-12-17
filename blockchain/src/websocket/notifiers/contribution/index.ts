import { Send, Message } from "../../index";
import { Notifier } from "../notifier";
import node, { BlockWithTransactions } from "../../../node";
import { store, getWatchAddresses } from "../../../store";
import env from "../../../env";

interface ContributionConfirmationPayload {
  to: string;
  amount: string;
  txid: string;
  memo: string;
}

export default class ContributionNotifier implements Notifier {
  private send: Send = () => null;

  receive = (message: Message) => {
    switch (message.type) {
      case "contribution:disclosure":
        return this.handleContributionDisclosure(message.payload);
    }
  };

  onNewBlock = (block: BlockWithTransactions) => {
    const state = store.getState();
    const addresses = getWatchAddresses(state);
    const tAddresses = addresses.map(addrs => addrs.transparent);
    console.info(`Block ${block.height} has ${block.tx.length} transactions`);
    block.tx.forEach(tx => {
      tx.vout.forEach(vout => {
        // Addresses is an array because of multisigs, but we'll never
        // generate one, so all of our addresses will only have addresses[0]
        const to = vout.scriptPubKey.addresses[0];
        if (tAddresses.includes(to)) {
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

  registerSend = (sm: Send) => (this.send = sm);

  private handleContributionDisclosure = async (payload: any) => {
    try {
      const disclosure = await node.z_validatepaymentdisclosure(payload.disclosure);
      if (disclosure.valid && disclosure.paymentAddress === env.SPROUT_ADDRESS) {
        this.sendContributionConfirmation({
          to: disclosure.paymentAddress,
          amount: disclosure.value.toString(),
          txid: disclosure.txid,
          memo: disclosure.memo,
        });
      }
      else {
        console.warn('Unattributable payment disclosure provided:');
        console.warn(JSON.stringify(disclosure, null, 2));
      }
    } catch(err) {
      console.error(err.response ? err.response.data : err);
    }
  };

  private sendContributionConfirmation = (payload: ContributionConfirmationPayload) => {
    this.send({
      payload,
      type: 'contribution:confirmation',
    });
  };
}
