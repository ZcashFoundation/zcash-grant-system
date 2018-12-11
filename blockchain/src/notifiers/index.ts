import Clock from "./clock";
import { Send, Message } from "../service";

export interface Notifier {
  registerSend(send: Send): void;
  receive(message: Message): void;
  destroy(): void;
}

export const initializeNotifiers = () => [new Clock()] as Notifier[];
