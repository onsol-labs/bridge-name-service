var BNS = artifacts.require("BNS");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(BNS);
};
