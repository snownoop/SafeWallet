const Multisig = artifacts.require("Multisig");
const zeppelin = require('openzeppelin-test-helpers');

contract("Multisig", accounts => {

  let acc1 = accounts[0]; 
  let acc2 = accounts[1];

  it("Balance after deposit should be 100", () => {
    let multi;

  return Multisig.deployed()
    .then(instance => { 
      multi = instance;
      multi.deposit(acc2, { value: 50 , from: acc1 }); 
    })
    .then(() => {
      multi.deposit_CIx({ value: 50 , from: acc1 }); 
    })
    .then(() => {
      return multi.balances.call(acc1);
    })
    .then(balance => {
      assert.equal(balance.valueOf(), 100, "100 should be the correct balance");
    })
  });

  it("After depositing safely both the balance and associate safe public key have to be correct", () => {
    let multi;

  return Multisig.deployed()
    .then(instance => { 
      multi = instance;
      multi.deposit(acc1, { value: 100 , from: acc2 }); 
    })
    .then(() => {return multi.balances.call(acc2);})
    .then(balance => {
      assert.equal(balance.valueOf(), 100, "100 should be the correct balance");
      return multi.safetyKeys.call(acc2);
    })
    .then(safetyPublickey => {
      assert.equal(safetyPublickey, acc1, "Safety public key is not correct");
    })
  });

  it("Checking state of contract balance after send transaction", () => {
    let multi;

    return Multisig.deployed()
      .then(instance => { 
        multi = instance;
        return multi.verifyTransaction_26e(acc1, 5, '0x979a00738494f45fbf84e2a00d5985c0235d7fdd5b9eafe113f0e9eaedac400b1e405c7ed15ead3022504ef593bb3066c58c42793e4bd4a322700d38637e77551b', {
          from: acc1
        })
      })
      .then(() => {
        return multi.balances.call(acc1);
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 95, "95 should be the correct balance");
      })
  });

  it("Nonce of acc1 should be 1 after sending transaction", () =>
    Multisig.deployed()
      .then(instance => instance.transactionNonces.call(acc1))
      .then(nonce => {
        assert.equal(nonce.valueOf(), 1, "1 nonce wasn't in the first account");
      })
  );

  it("Transaction co-signed by backup key should also succeed", () => {
    let multi;

    return Multisig.deployed()
      .then(instance => { 
        multi = instance;
        return multi.verifyTransaction_26e(acc1, 10, '0xbdeb553ba00191b598307bf91f3265c6c0b28807533889acd84f5d39128a44457a1bddc5441ffc65dc4f6df61f7caf89b73e0bbb0d41d1d862b88bc5edbc5a5f1b', {
          from: acc1
        })
      })
      .then(() => {
        return multi.balances.call(acc1);
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 85, "85 should be the correct balance");
      })
  });

  it("Recovering funds to backup/safe address should fail if not enough time elapsed", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
        multi.deposit_CIx({ value: 100 , from: acc2 });
        return multi.safetyKeys.call(acc2);
      })
      .then(safetyPublickey => {
        assert.equal(safetyPublickey, acc1, "Safety public key is not correct");
      }) 
      .then(async () => {
        await zeppelin.expectRevert(
          multi.recoverFundsToSafeAddress(acc2, acc1, 5, { from: acc2 }), "Not enough time elapsed to recover to backup address"
        );
      });
  });

  it("Recovering funds to backup/safe address should fail if wrong address is provided", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
      })
      .then(async () => {
        await zeppelin.time.increase(121);
        await zeppelin.expectRevert(
          multi.recoverFundsToSafeAddress(acc2, acc2, 5, { from: acc2 }), "Address is not correct"
          );
      }) 
  });

  it("Recovering funds to backup/safe address should fail if amount specified exceeds balance", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
      })
      .then(async () => {
        await zeppelin.time.increase(121);
        await zeppelin.expectRevert(
          multi.recoverFundsToSafeAddress(acc2, acc1, 500, { from: acc2 }), "Not enough balance"
          );
      }) 
  });

  it("Recovering funds to backup/safe address should work if enough time elapsed", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
        multi.deposit_CIx({ value: 100 , from: acc2 });
        return multi.safetyKeys.call(acc2);
      })
      .then(safetyPublickey => {
        assert.equal(safetyPublickey, acc1, "Safety public key is not correct");
      }) 
      .then(async () => {
        await zeppelin.time.increase(121);
        multi.recoverFundsToSafeAddress(acc2, acc1, 5, { from: acc2 });
        return multi.balances.call(acc2);
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 295, "295 should be the correct balance");
      });
  });

  it("Recovering funds to any address should fail if not enough time elapsed", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
        multi.deposit_CIx({ value: 100 , from: acc2 });
        return multi.safetyKeys.call(acc2);
      })
      .then(safetyPublickey => {
        assert.equal(safetyPublickey, acc1, "Safety public key is not correct");
      }) 
      .then(async () => {
        await zeppelin.expectRevert(
          multi.recoverFunds(acc2, acc2, 5, { from: acc2 }), "Not enough time elapsed to recover to any address"
        );
      });
  });

  it("Recovering funds to any address should fail if amount specified exceeds balance", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
      })
      .then(async () => {
        await zeppelin.time.increase(301);
        await zeppelin.expectRevert(
          multi.recoverFunds(acc2, acc2, 500, { from: acc2 }), "Not enough balance"
          );
      }) 
  });

  it("Recovering funds to any address should work if enough time elapsed", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
        multi.deposit_CIx({ value: 100 , from: acc2 });
        return multi.safetyKeys.call(acc2);
      })
      .then(safetyPublickey => {
        assert.equal(safetyPublickey, acc1, "Safety public key is not correct");
      }) 
      .then(async () => {
        await zeppelin.time.increase(301);
        multi.recoverFunds(acc2, acc2, 5, { from: acc2 });
        return multi.balances.call(acc2);
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 490, "490 should be the correct balance");
      });
  });

  it("When the limit is set transaction above the limit should revert, but below the limit should be ok", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
        multi.setDailyLimit(100, '0xd6fa95194d78a407610ef243d2ee15b7e86ad5a22841159e39a2cd82c694efc509127ce9d0a5b3a65239042b5bbefecaa7ddf71b58f50a3da33aa6002703f4fa1c' , { from: acc2 });
      })
      .then(async () => {
        await zeppelin.expectRevert(
          multi.verifyTransaction_26e(acc2, 105, '0x11b6327f9e1f3b83d332af578cee3ae66e2347516998bcddd44474cba503ebd4168366bdb737c0668163d840e81a5eeef7a2eb662858eacdea70b1f499d86a5b1b', { from: acc2 }), "Transaction amount exceeds daily limit"
        );
      })
      .then(() => {
        multi.verifyTransaction_26e(acc2, 95, '0x928d09391fc0c5c112cae342f440320c43c263745e13e0e308ddc8ac72bd90c804ff23c8150529f5c0f665da280929e6d6e633fd03eb20800c6916103c578f8a1c', { from: acc2 });
        return multi.balances.call(acc2);
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 395, "395 should be the correct balance");
      });
  });

  it("With limit removed previously failing transaction should be ok", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
        multi.withdrawLimit('0x21a7716a5b2ce84d6955e12180cc52554dc5eb1ee752a4ac7906d8b58e8fa5563dcdf344888ac034e74953dbd0ec6f80be4b838254d8364bd0cdffb7eaf59d6c1b' , { from: acc2 });
      })
      .then(() => {
        multi.verifyTransaction_26e(acc2, 105, '0x95ec61a05a939c64616c6834b21369fdd50e794ab9cae4f18b6b410a7ba62fca37689aecfc68411fb81ca1484416f2231244c183b732785463de9280aff8cf291c', { from: acc2 });
        return multi.balances.call(acc2);
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 290, "290 should be the correct balance");
      });
  });

  it("When the limit is set multiple transaction below the limit should succeed", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
        multi.setDailyLimit(1000, '0x07ed794c03b104e4d5d5f84f1bcf162318b009e8793b7898a1240ab9cfdea78b32faa675c67b4f90ea06b9cbe1b21df0c448e0f2132f6beae5bb73882ccf32801b' , { from: acc2 });
      })
      .then(() => {
        multi.verifyTransaction_26e(acc2, 10, '0x9a6107657495d1510f88b97e9d6f1582cce48a3b5a173c6318534129e77e7b586ed1e244e927a631f17dac7fae598e833bd30e472eff7fdbc0a97ad9da334d4e1c', { from: acc2 });
      })
      .then(() => {
        multi.verifyTransaction_26e(acc2, 10, '0x0af50d236331324f526bb532d9bbd23eab58b77611711e76e2e41ddde079c6be36223073fd84fbdd97befd3e99539495aeda39337087e3ff93c09e95cf900b771b', { from: acc2 });
        return multi.balances.call(acc2);
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 270, "270 should be the correct balance");
      });
  });


  it("Attempt to set daily limit with an incorrect signature fails", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
      })
      .then(async () => {
        await zeppelin.expectRevert(
          multi.setDailyLimit(105, '0x00', { from: acc1 }), "Incorrect signature"
        );
      })
  });

  it("Attempt to withdraw limit with an incorrect signature fails", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
      })
      .then(async () => {
        await zeppelin.expectRevert(
          multi.withdrawLimit('0x00', { from: acc1 }), "Incorrect signature"
        );
      })
  });

  it("Attempt to register backup address with nonzero balance fails", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
      })
      .then(async () => {
        await zeppelin.expectRevert(
          multi.deposit(acc2, { value: 5000 , from: acc1 }), "Balance has to be zero"
        );
      })
  });

  it("Transfers with amounts above current balance should fail", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
      })
      .then(async () => {
        await zeppelin.expectRevert(
          multi.verifyTransaction_26e(acc2, 105, '0x00', { from: acc1 }), "Not enough balance"
        );
      })
  });

  it("Transfers with an incorrect signature should fail", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
      })
      .then(async () => {
        await zeppelin.expectRevert(
          multi.verifyTransaction_26e(acc2, 5, '0x00', { from: acc1 }), "Incorrect signature"
        );
      })
  });

  it("When the limit is set all daily transaction should not break the limit", () => {

    let multi;

    return Multisig.deployed()
      .then(instance => {
        multi = instance;
        multi.setDailyLimit(50, '0x44b047a4a99f11880c67243f7eae2e906aae072853218893efc9ad9f85e3c1f212fb8cbff4dae73a00c857d436aacbad1ba21f6a277ae1e1f6ab5a8f844ddb551c' , { from: acc1 });
      })
      .then( () => {
        multi.verifyTransaction_26e(acc1, 10, '0x7a42e93fecf62f8ef20f18a993d6e25487e6dbd22fdc564814003b9ca9b1f8bd1e73e407138702eaf07a2f5a95c57efddb0cb70762cc26d64971083161258e311c', { from: acc1 });  
      })
      .then(async () => {
        await zeppelin.expectRevert(
          multi.verifyTransaction_26e(acc1, 60, '0x0dbb374f7f8c193a679acc59c6e5fc1e8323530ccf0579d5439260fdc0b06ec20779ec351a55b53e4286306c2590e4ce80478e035594506b7951e53195c002481c', { from: acc1 }), "Transaction amount exceeds daily limit"
          );
      })
  });

});