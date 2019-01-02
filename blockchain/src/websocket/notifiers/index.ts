import { Notifier } from './notifier';
import BlockchainNotifier from './blockchain';
import ContributionNotifier from './contribution';

export const initializeNotifiers = () => [
  new BlockchainNotifier(),
  new ContributionNotifier(),
] as Notifier[];
