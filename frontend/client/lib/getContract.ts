export class WrongNetworkError extends Error {}

const getContractInstance = async (
  web3: any,
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
  return new web3.eth.Contract(contractDefinition.abi, deployedAddress);
};

export default getContractInstance;
