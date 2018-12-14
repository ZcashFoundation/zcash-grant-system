import { Send, Message } from "../../index";
import { Notifier } from "../notifier";
import node from "../../../node";
import env from "../../../env";

interface ContributionConfirmationPayload {
  to: string;
  amount: string;
  balance: string;
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

  onNewBlock = () => {
    // Check contributions
  };

  registerSend = (sm: Send) => (this.send = sm);

  private handleContributionDisclosure = async (payload: any) => {
    try {
      const disclosure = await node.z_validatepaymentdisclosure(payload.disclosure);
      if (disclosure.valid && disclosure.paymentAddress === env.SPROUT_ADDRESS) {
        const balance = await node.z_getbalance(env.SPROUT_ADDRESS);
        this.sendContributionConfirmation({
          to: disclosure.paymentAddress,
          amount: disclosure.value.toString(),
          balance: balance.toString(),
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
