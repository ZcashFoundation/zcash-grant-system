import Web3 from 'web3';

export class WrongNetworkError extends Error {}

const getContractInstance = async (
  web3: Web3,
  contractDefinition: any,
  deployedAddress?: string,
) => {
  // get network ID and the deployed address
  const networkId = await web3.eth.net.getId();
  if (!deployedAddress && !contractDefinition.networks[networkId]) {
    throw new WrongNetworkError('Wrong web3 network configured');
  }

  deployedAddress = deployedAddress || contractDefinition.networks[networkId].address;

  // create the instance
  const contract = new web3.eth.Contract(contractDefinition.abi, deployedAddress);

  // use gas from e2e injected window.web3.provider
  if ((web3.currentProvider as any)._e2eContractGas) {
    contract.options.gas = (web3.currentProvider as any)._e2eContractGas;
  }
  return contract;
};

export default getContractInstance;
