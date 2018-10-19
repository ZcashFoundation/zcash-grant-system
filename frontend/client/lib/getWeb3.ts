import Web3 from 'web3';

interface Web3Window extends Window {
  web3?: Web3;
}

const resolveWeb3 = (resolve: (web3: Web3) => void, reject: (err: Error) => void) => {
  if (typeof window === 'undefined') {
    return reject(new Error('No global window variable'));
  }

  let { web3 } = window as Web3Window;
  const localProvider = `http://localhost:8545`;

  // To test what it's like to not have web3, uncomment the reject. Otherwise
  // localProvider will always kick in.
  // return reject(new Error('No web3 instance available'));

  if (typeof web3 !== 'undefined') {
    console.info(`Injected web3 detected.`);
    web3 = new Web3(web3.currentProvider);
  } else if (process.env.NODE_ENV !== 'production') {
    console.info(`No web3 instance injected, using Local web3.`);
    const provider = new Web3.providers.HttpProvider(localProvider);
    web3 = new Web3(provider);
  } else {
    return reject(new Error('No web3 instance available'));
  }

  resolve(web3);
};

export default () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener(`load`, () => {
      resolveWeb3(resolve, reject);
    });
    // If document has loaded already, try to get Web3 immediately.
    if (document.readyState === `complete`) {
      resolveWeb3(resolve, reject);
    }
  });
