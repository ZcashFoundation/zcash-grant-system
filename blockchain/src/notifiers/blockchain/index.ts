import { Send } from "../../service";
import { Notifier } from "../notifier";
import { Block } from "../../node";

export default class ContributionNotifier implements Notifier {
  private send: Send = () => null;

  onNewBlock = (block: Block) => {
    this.send({
      type: "blockchain:block",
      payload: block,
    });
  };

  registerSend = (sm: Send) => (this.send = sm);
}
