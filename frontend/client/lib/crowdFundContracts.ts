import Web3 from 'web3';
import getContractInstance from './getContract';
import { fetchCrowdFundJSON } from 'api/api';

const contractCache = {} as { [key: string]: any };

export async function getCrowdFundContract(web3: Web3 | null, deployedAddress: string) {
  if (!web3) {
    throw new Error('getCrowdFundAddress: web3 was null but is required!');
  }
  if (!contractCache[deployedAddress]) {
    let CrowdFund;
    if (process.env.CROWD_FUND_FACTORY_URL) {
      CrowdFund = await fetchCrowdFundJSON();
    } else {
      CrowdFund = await import('./contracts/CrowdFund.json');
    }
    try {
      contractCache[deployedAddress] = await getContractInstance(
        web3,
        CrowdFund,
        deployedAddress,
      );
    } catch (e) {
      console.error(`Could not lookup crowdFund contract @ ${deployedAddress}: `, e);
      return null;
    }
  }
  return contractCache[deployedAddress];
}
