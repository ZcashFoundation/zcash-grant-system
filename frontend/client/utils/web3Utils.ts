import { TransactionObject } from 'web3/eth/types';

type Web3Method<T> = (index: number) => TransactionObject<T>;

export async function collectArrayElements<T>(
  method: Web3Method<T>,
  account: string,
): Promise<T[]> {
  const arrayElements = [];
  let noError = true;
  let index = 0;
  while (noError) {
    try {
      arrayElements.push(await method(index).call({ from: account }));
      index += 1;
    } catch (e) {
      noError = false;
    }
  }
  return arrayElements;
}
