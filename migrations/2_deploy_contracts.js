var Main = artifacts.require("./Burger.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Main, accounts[1]);
};
