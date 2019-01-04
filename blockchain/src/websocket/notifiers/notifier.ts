import { Send, Message } from "../index";
import { Block } from "../../node";

export interface Notifier {
  registerSend(send: Send): void;
  receive?(message: Message): void;
  onNewBlock?(block: Block): void;
  destroy?(): void;
}