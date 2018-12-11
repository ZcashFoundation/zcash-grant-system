import { Send, Message } from "../../service";
import { Notifier } from "..";

export default class Clock implements Notifier {
  private send: Send = () => null;

  private sendClockMessage = () => {
    this.send({ type: "clock", payload: { time: new Date().toISOString() } });
  };

  private intervalId = setInterval(this.sendClockMessage, 10000);

  receive = (message: Message) => {
    if (message.type === "clock") {
      if (message.payload === "getTime") {
        this.send({
          type: "clock",
          payload: { time: new Date().toISOString() }
        });
      }
    }
  };

  registerSend = (sm: Send) => (this.send = sm);

  destroy = () => clearInterval(this.intervalId);
}
