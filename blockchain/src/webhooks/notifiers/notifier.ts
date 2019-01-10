import { Send } from "../index";
import { Block } from "../../node";

export interface Notifier {
  registerSend(send: Send): void;
  onNewBlock?(block: Block): void;
  destroy?(): void;
}
