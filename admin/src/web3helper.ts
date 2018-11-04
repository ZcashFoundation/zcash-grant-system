import { pick } from 'lodash';
import Web3 from 'web3';
import { TransactionObject } from 'web3/eth/types';
import EthContract from 'web3/eth/contract';
import { TApp } from './store';
import CrowdFundFactory from 'contracts/contracts/CrowdFundFactory.json';
import CrowdFund from 'contracts/contracts/CrowdFund.json';
import {
  Proposal,
  Contract,
  INITIAL_CONTRACT,
  ContractMilestone,
  ContractContributor,
  ContractMethodInput,
  INITIAL_CONTRACT_CONTRIBUTOR,
  INITIAL_CONTRACT_MILESTONE,
} from './types';

type Web3Method<T> = (index: number) => TransactionObject<T>;

export async function initializeWeb3(app: TApp): Promise<null | Web3> {
  let web3 = (window as any).web3;
  if (web3) {
    app.web3Type = 'injected';
    web3 = new Web3(web3.currentProvider);
  } else if (process.env.NODE_ENV !== 'production') {
    const localProviderString = 'http://localhost:8545';
    const provider = new Web3.providers.HttpProvider(localProviderString);
    web3 = new Web3(provider);
    app.web3Type = 'local - ' + localProviderString;
  } else {
    console.error('No web3 detected!');
    app.web3Enabled = false;
    return null;
  }
  try {
    app.ethNetId = await web3.eth.net.getId();
    getAccount(app, web3);
    window.setInterval(() => getAccount(app, web3), 10000);
    checkCrowdFundFactory(app, web3);
    app.web3Enabled = true;
    return web3;
  } catch (e) {
    if (e.message && e.message.startsWith('Invalid JSON RPC response:')) {
      console.warn('Unable to interact with web3. Web3 will be disabled.');
    } else {
      console.error('There was a problem interacting with web3.', e);
    }
    app.web3Enabled = false;
    return null;
  }
}

async function getAccount(app: TApp, web3: Web3) {
  await web3.eth.getAccounts((_, accounts) => {
    app.ethAccount = (accounts.length && accounts[0]) || '';
  });
}

function checkCrowdFundFactory(app: TApp, web3: Web3) {
  web3.eth.net.getId((_, netId) => {
    const networks = Object.keys((CrowdFundFactory as any).networks).join(', ');
    if (!(CrowdFundFactory as any).networks[netId]) {
      app.crowdFundFactoryDefinitionStatus = `network mismatch (has ${networks})`;
    } else {
      app.crowdFundFactoryDefinitionStatus = `loaded, has correct network (${networks})`;
    }
  });
}

export async function proposalContractSend(
  app: TApp,
  web3: Web3,
  proposalId: string,
  methodName: keyof Contract,
  inputs: ContractMethodInput[],
  args: any[],
) {
  const storeProposal = app.proposals.find(p => p.proposalId === proposalId);
  if (storeProposal) {
    await getAccount(app, web3);
    const storeMethod = storeProposal.contract[methodName];
    const contract = new web3.eth.Contract(CrowdFund.abi, proposalId);
    app.crowdFundGeneralStatus = `calling (${storeProposal.title}).${methodName}...`;
    try {
      console.log(args);
      storeMethod.status = 'loading';
      storeMethod.error = '';
      if (inputs.length === 1 && inputs[0].name === 'value') {
        await contract.methods[methodName]()
          .send({
            from: app.ethAccount,
            value: args[0],
          })
          .once('transactionHash', () => {
            storeMethod.status = 'waiting';
          })
          .once('confirmation', () => {
            storeMethod.status = 'loaded';
          });
      } else {
        await contract.methods[methodName](...args)
          .send({ from: app.ethAccount })
          .once('transactionHash', () => {
            storeMethod.status = 'waiting';
          })
          .once('confirmation', () => {
            storeMethod.status = 'loaded';
          });
      }
    } catch (e) {
      console.error(e);
      storeMethod.error = e.message || e.toString();
      storeMethod.status = 'error';
    }
    app.crowdFundGeneralStatus = `idle`;
  }
}

export async function populateProposalContract(
  app: TApp,
  web3: Web3,
  proposalId: string,
) {
  const storeProposal = app.proposals.find(p => p.proposalId === proposalId);
  const contract = new web3.eth.Contract(CrowdFund.abi, proposalId);

  if (storeProposal) {
    storeProposal.contractStatus = 'loading...';
    const methods = Object.keys(INITIAL_CONTRACT).map(k => k as keyof Contract);
    for (const method of methods) {
      const methodType = INITIAL_CONTRACT[method].type;
      if (methodType !== 'deep' && methodType !== 'send') {
        app.crowdFundGeneralStatus = `calling (${storeProposal.title}).${method}...`;
        const storeMethod = storeProposal.contract[method];
        const contractMethod = contract.methods[method];
        try {
          storeMethod.status = 'loading';
          if (methodType === 'eth' && method === 'getBalance') {
            storeMethod.value = (await web3.eth.getBalance(proposalId)) + '';
          } else if (methodType === 'array') {
            const result = await collectArrayElements(contractMethod, app.ethAccount);
            if (method === 'milestones') {
              storeMethod.value = result.map(r =>
                // clean-up incoming object before attaching to store
                cleanClone(INITIAL_CONTRACT_MILESTONE, r),
              );
            } else {
              storeMethod.value = result.map(r => r + '');
            }
          } else {
            storeMethod.value =
              (await contractMethod().call({ from: app.ethAccount })) + '';
          }
          storeMethod.status = 'loaded';
        } catch (e) {
          console.error(proposalId, method, e);
          storeMethod.status = 'error';
        }
      }
    }
    await populateProposalContractDeep(storeProposal.contract, contract, app.ethAccount);
    storeProposal.contractStatus = 'updated @ ' + new Date().toISOString();
    app.crowdFundGeneralStatus = `idle`;
  }
}

async function populateProposalContractDeep(
  storeContract: Proposal['contract'],
  contract: EthContract,
  fromAcct: string,
) {
  storeContract.contributors.status = 'loading';
  const milestones = storeContract.milestones.value as ContractMilestone[];
  const contributorList = storeContract.contributorList.value as string[];
  const contributors = await Promise.all(
    contributorList.map(async addr => {
      const contributor = await contract.methods
        .contributors(addr)
        .call({ from: fromAcct });
      contributor.address = addr;
      contributor.milestoneNoVotes = await Promise.all(
        milestones.map(
          async (_, idx) =>
            await contract.methods
              .getContributorMilestoneVote(addr, idx)
              .call({ from: fromAcct }),
        ),
      );
      contributor.contributionAmount = await contract.methods
        .getContributorContributionAmount(addr)
        .call({ from: fromAcct });
      // clean-up incoming object before attaching to store
      return cleanClone(INITIAL_CONTRACT_CONTRIBUTOR, contributor);
    }),
  );
  storeContract.contributors.value = contributors as ContractContributor[];
  storeContract.contributors.status = 'loaded';
}

// clone and filter keys by keySource object's keys
export function cleanClone<T extends object>(keySource: T, target: Partial<T>) {
  const sourceKeys = Object.keys(keySource);
  const fullClone = { ...(target as object) };
  const clone = pick(fullClone, sourceKeys);
  return clone as T;
}

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
