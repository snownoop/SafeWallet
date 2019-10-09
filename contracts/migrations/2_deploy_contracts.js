var ECDSA = artifacts.require("./ECDSA.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var Multisig = artifacts.require("./Multisig.sol");
var FirstERC = artifacts.require("./FirstERC.sol");
var MultisigERC20 = artifacts.require("./MultisigERC20.sol");


module.exports = function(deployer) {

  deployer.then(async () => {
        await deployer.deploy(ECDSA);
        await deployer.link(ECDSA, Multisig);
        await deployer.deploy(SafeMath);
        await deployer.link(SafeMath, Multisig);
        await deployer.deploy(Multisig);
        await deployer.link(SafeMath, FirstERC);
        await deployer.deploy(FirstERC);
        await deployer.link(ECDSA, MultisigERC20);
        await deployer.link(SafeMath, MultisigERC20);
        await deployer.deploy(MultisigERC20);
    })
  
};
