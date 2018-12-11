import { Send, Message } from "../service";
import { Block } from "../node";

export interface Notifier {
  registerSend(send: Send): void;
  receive?(message: Message): void;
  onNewBlock?(block: Block): void;
  destroy?(): void;
}