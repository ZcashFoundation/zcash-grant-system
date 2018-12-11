import { Send, Message } from "../../service";
import { Notifier } from "../notifier";

export default class ContributionNotifier implements Notifier {
  private send: Send = () => null;

  receive = (message: Message) => {
    if (message.type !== "contribution") {
      return;
    }
  };

  onNewBlock = () => {

  };

  registerSend = (sm: Send) => (this.send = sm);
}
