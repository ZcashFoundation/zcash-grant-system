import Web3 from 'web3';

interface Web3Window extends Window {
  web3?: Web3;
}

let clientWeb3: null | Web3 = null;

const resolveWeb3 = (resolve: (web3: Web3) => void, reject: (err: Error) => void) => {
  if (clientWeb3) {
    return resolve(clientWeb3);
  }
  if (typeof window === 'undefined') {
    return reject(new Error('No global window variable'));
  }
  let { web3 } = window as Web3Window;
  if (typeof web3 !== 'undefined') {
    console.info(`Injected web3 detected.`);
    web3 = new Web3(web3.currentProvider);
  } else {
    return reject(new Error('No web3 instance available'));
  }
  clientWeb3 = web3;
  resolve(web3);
};

export const initializeWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener(`load`, () => {
      resolveWeb3(resolve, reject);
    });
    // If document has loaded already, try to get Web3 immediately.
    if (document.readyState !== `loading`) {
      resolveWeb3(resolve, reject);
    }
  });

export default () => {
  if (clientWeb3) {
    return clientWeb3;
  } else {
    throw new Error(
      'getWeb3 - web3 does not exist or is not yet initialized.' +
        ' Use store.web3.isMissingWeb3 to guard this behavior.',
    );
  }
};
