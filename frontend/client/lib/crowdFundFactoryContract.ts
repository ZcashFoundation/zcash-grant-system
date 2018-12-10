import Web3 from 'web3';
import getContractInstance from './getContract';
import { fetchCrowdFundFactoryJSON } from 'api/api';

let crowdFundFactory: any = null;
let CrowdFundFactory: any = null;

export async function getCrowdFundFactoryContract(web3: Web3 | null) {
  if (!web3) {
    throw new Error('getCrowdFundFactoryContract: web3 was null but is required.');
  }
  if (!crowdFundFactory) {
    if (!CrowdFundFactory) {
      try {
        CrowdFundFactory = await fetchCrowdFundFactoryJSON();
      } catch (err) {
        console.error(err);
        throw new Error('getCrowdFundFactoryContract: could not fetch definition JSON.');
      }
    }
    crowdFundFactory = await getContractInstance(web3, CrowdFundFactory);
  }
  return crowdFundFactory;
}
