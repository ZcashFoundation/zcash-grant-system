const CrowdFundFactory = artifacts.require("./CrowdFundFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(CrowdFundFactory);
};
