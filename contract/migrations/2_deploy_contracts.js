const CrowdFundFactory = artifacts.require("./CrowdFundFactory.sol");
const PrivateFundFactory = artifacts.require("./PrivateFundFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(CrowdFundFactory);
  deployer.deploy(PrivateFundFactory);
};
