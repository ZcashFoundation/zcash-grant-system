import Web3 = require("web3");
import * as CrowdFundFactory from "../../contract/build/contracts/CrowdFundFactory.json";

export const loadWeb3 = (window: any) => {
  window.web3 = new Web3(`ws://localhost:8545`);
  return window.web3.eth.net.getId().then((id: string) => {
    console.log("loadWeb3: connected to networkId: " + id);
  });
};

export const createCrowdFund = (web3: Web3) => {
  const HOUR = 3600;
  const DAY = HOUR * 24;
  const ETHER = 10 ** 18;
  const NOW = Math.round(new Date().getTime() / 1000);

  return web3.eth.net.getId().then((id: number) => {
    const factoryAddy = (CrowdFundFactory as any).networks[id].address;
    const factory = new web3.eth.Contract(
      (CrowdFundFactory as any).abi,
      factoryAddy
    );

    return web3.eth.getAccounts().then((accounts: string[]) => {
      const raiseGoal = 1 * ETHER;
      const beneficiary = accounts[1];
      const trustees = [accounts[1]];
      const milestones = [raiseGoal + ""];
      const deadline = NOW + DAY * 100;
      const milestoneVotingPeriod = HOUR;
      const immediateFirstMilestonePayout = false;

      return factory.methods
        .createCrowdFund(
          raiseGoal + "",
          beneficiary,
          trustees,
          milestones,
          deadline,
          milestoneVotingPeriod,
          immediateFirstMilestonePayout
        )
        .send({
          from: accounts[4],
          // important
          gas: 3695268
        })
        .then(
          (receipt: any) =>
            receipt.events.ContractCreated.returnValues.newAddress
        );
    });
  });
};

export const randomString = () => {
  return Math.random()
    .toString(36)
    .substring(7);
};

export const randomHex = function(len: number) {
  const maxlen = 8;
  const min = Math.pow(16, Math.min(len, maxlen) - 1);
  const max = Math.pow(16, Math.min(len, maxlen)) - 1;
  const n = Math.floor(Math.random() * (max - min + 1)) + min;
  let r = n.toString(16);
  while (r.length < len) {
    r = r + randomHex(len - maxlen);
  }
  return r;
};
