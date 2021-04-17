var Main = artifacts.require("./BurgerMenuOrder.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Main, accounts[1]);
};
