import { Send } from "../../index";
import { Notifier } from "../notifier";
import { Block } from "../../../node";

export default class ContributionNotifier implements Notifier {
  private send: Send = () => null;

  onNewBlock = (block: Block) => {
    // Uncomment below if you want to see new blocks!
    // this.send({
    //   type: "blockchain:block",
    //   payload: block,
    // });
  };

  registerSend = (sm: Send) => (this.send = sm);
}
