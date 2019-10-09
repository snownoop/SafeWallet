const FirstERC = artifacts.require("./FirstERC");
const MultisigERC20 = artifacts.require("./MultisigERC20");
const zeppelin = require('openzeppelin-test-helpers');

contract("MultisigERC20", accounts => { 

  let acc1 = accounts[0];	
  let acc2 = accounts[1];
  let tokemImperialSymbol = '0x746f6b656e496d70657269616c00000000000000000000000000000000000000';
  let incorrectToken = '0x0000000000000000000000000000000000000000000000000000000000000000';
  let incorrectSignature = '0x0';

  it("Balance after deployment should be 5000000", () => {
  	let TokenERC;
  	let MultisigERC;
  	let MultisigAddress;

	return FirstERC.deployed()
	  .then(instance => { 
	  	TokenERC = instance;
	  	return TokenERC.balanceOf(acc1, { from: acc1 }); 
	  })
	  .then(balance => {
	    assert.equal(balance.valueOf(), 5000000, "5000000 should be the correct balance");
	    return MultisigERC20.deployed();
	  })
	  .then(instance => {
  	  	MultisigERC = instance;
  	  	MultisigAddress = MultisigERC.address;
  	  })

  });

  it("Increasing allowance should work correctly", () => {
  	let TokenERC;
  	let MultisigERC;
  	let MultisigAddress;

	return FirstERC.deployed()
	  .then(instance => { 
	  	TokenERC = instance;
	  	return MultisigERC20.deployed();
	  })
	  .then(instance => {
  	  	MultisigERC = instance;
  	  	MultisigAddress = MultisigERC.address;
  	  	TokenERC.increaseAllowance(MultisigAddress, 1000, { from: acc1 });
  	  })
  	  .then(() => {
  	  	return TokenERC.allowance(acc1, MultisigAddress, { from: acc1 }); 
  	  })
  	  .then(allowance => {
  	  	assert.equal(allowance, 1000, "Correct allowance should be 1000");
  	  })
  });

  it("Removing token should work correctly", () => {
    let TokenERC;
    let TokenAddress;
    let MultisigERC;
    let MultisigAddress;

  return FirstERC.deployed()
    .then(instance => { 
      TokenERC = instance;
      TokenAddress = TokenERC.address;
      return MultisigERC20.deployed();
    })
    .then(instance => {
        MultisigERC = instance;
        MultisigAddress = MultisigERC.address;
        MultisigERC.addNewToken(tokemImperialSymbol, TokenAddress, { from: acc1 });
        MultisigERC.removeToken(tokemImperialSymbol, { from: acc1 });
        return MultisigERC.tokens(tokemImperialSymbol, { from: acc1 });
      })
      .then(address => {
        assert.equal(address, '0x0000000000000000000000000000000000000000', { from: acc1 });
      })

  });

  it("Adding new tokens should work correctly", () => {
    let TokenERC;
    let TokenAddress;
    let MultisigERC;
    let MultisigAddress;

  return FirstERC.deployed()
    .then(instance => { 
      TokenERC = instance;
      TokenAddress = TokenERC.address;
      return MultisigERC20.deployed();
    })
    .then(instance => {
        MultisigERC = instance;
        MultisigAddress = MultisigERC.address;
        MultisigERC.addNewToken(tokemImperialSymbol, TokenAddress, { from: acc1 });
        return MultisigERC.tokens(tokemImperialSymbol, { from: acc1 });
      })
      .then(address => {
        assert.equal(address, TokenAddress, { from: acc1 });
      })

  });

  it("Attempt to register backup address with not registered Token fails", () => {

    let MultisigERC;

    MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
        
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.depositFunds(acc2, incorrectToken, 400, { from: acc1 }),
          "Token not registered"
        );
    })
  });

  it("Attempt to register backup address with amount exceeding allowance fails", () => {

    let MultisigERC;

    MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
        
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.depositFunds(acc2, tokemImperialSymbol, 2000, { from: acc1 }),
          "Amount is larger than provided allowance"
        );
    })
  });

  it("Backup/safety address after deposit is correct", () => {
    let TokenERC;
    let TokenAddress;
    let MultisigERC;
    let MultisigAddress;

  return FirstERC.deployed()
    .then(instance => { 
      TokenERC = instance;
      TokenAddress = TokenERC.address;
      return MultisigERC20.deployed();
    })
    .then(instance => {
        MultisigERC = instance;
        MultisigAddress = MultisigERC.address;
        MultisigERC.depositFunds(acc2, tokemImperialSymbol, 400, { from: acc1 });
        return MultisigERC.safetyKeys(acc1, tokemImperialSymbol, { from: acc1 });
      })
      .then(safetyKey => {
        assert.equal(safetyKey, acc2, "Safety key should equal account 2 public address");
      })
  })

  it("Attempts to register new backup address while balance is positive fails", () => {

    let MultisigERC;

    MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
        return MultisigERC.safetyKeys(acc1, tokemImperialSymbol, { from: acc1 });
      })
    .then(async (safetyKey) => {
        assert.equal(safetyKey, acc2, "Safety key should equal account 2 public address");
        await zeppelin.expectRevert(
          MultisigERC.depositFunds(acc2, tokemImperialSymbol, 10, { from: acc1 }),
          "Balance is not zero"
        );
    })
  });

  it("Attempt to deposit with amount exceeding allowance fails", () => {

    let MultisigERC;

    MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
        
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.depositFunds_xur(tokemImperialSymbol, 2000, { from: acc1 }),
          "Amount is larger than provided allowance"
        );
    })
  });

  it("Attempt to depoist with not registered Token fails", () => {

    let MultisigERC;

    MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
        
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.depositFunds_xur(incorrectToken, 400, { from: acc1 }),
          "Token not registered"
        );
    })
  });

  it("Balance after deposit is correct", () => {
    let TokenERC;
    let TokenAddress;
    let MultisigERC;
    let MultisigAddress;

  return FirstERC.deployed()
    .then(instance => { 
      TokenERC = instance;
      TokenAddress = TokenERC.address;
      return MultisigERC20.deployed();
    })
    .then(instance => {
        MultisigERC = instance;
        MultisigAddress = MultisigERC.address;
        return MultisigERC.depositFunds_xur(tokemImperialSymbol, 400, { from: acc1 });
      })
      .then(() => {
        return MultisigERC.tokenBalances(acc1, tokemImperialSymbol, { from: acc1 });
      })
      .then(balance => {
        assert.equal(balance, 800, "Contract balance should be 800 after deposit");
      })
  })

  it("Incorrectly signed transfer fails", () => {

    let MultisigERC;

    return MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.verifyTransaction__ef(acc1, 305, '0x46116c1dcc057e90bb11a3ca56123902797f90445908a65f80bbb3e94d81e243297e2d4e91b999211b31b69d84037be5f0c474c54d34232db11b3046f6c253921b', tokemImperialSymbol, { from: acc1 }), 
          "Incorrect signature"
        );
    })
  });

  it("Attempt to transfer an amount larger than token balance fails", () => {

    let MultisigERC;

    return MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.verifyTransaction__ef(acc1, 1000, '0x46116c1dcc057e90bb11a3ca56123902797f90445908a65f80bbb3e94d81e243297e2d4e91b999211b31b69d84037be5f0c474c54d34232db11b3046f6c253921b', tokemImperialSymbol, { from: acc1 }), 
          "Not enough balance"
        );
    })
  });

  it("When the limit is set transaction above the limit should revert, but below the limit should be ok", () => {

    let TokenERC;
    let TokenAddress;
    let MultisigERC;
    let MultisigAddress;

    return FirstERC.deployed()
    .then(instance => { 
      TokenERC = instance;
      TokenAddress = TokenERC.address;
      return MultisigERC20.deployed();
    })
    .then(instance => {
        MultisigERC = instance;
        MultisigAddress = MultisigERC.address;
        MultisigERC.setDailyLimit(tokemImperialSymbol, 300, '0xdf462190657bc17e9bbabb2a52d2f34ed1852d29be61e14f0c8a3fe431f699827e30f8c9b397e165c90a71b62db7cf3a74000b776695e72336b823961f23db131b' , { from: acc1 });
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.verifyTransaction__ef(acc1, 305, '0x46116c1dcc057e90bb11a3ca56123902797f90445908a65f80bbb3e94d81e243297e2d4e91b999211b31b69d84037be5f0c474c54d34232db11b3046f6c253921b', tokemImperialSymbol, { from: acc1 }), "Transaction amount exceeds daily limit"
        );
    })
    .then(() => {
          MultisigERC.verifyTransaction__ef(acc1, 295, '0x3ecd5327e0f8d50cf2a8a876689b4a799886fc3d3d62ea31d17210dc3eddddb168bf285c588a16770df52b1c06a858036d18acb4bd92a6fc226feaab0b48b5ee1b', tokemImperialSymbol, { from: acc1 });
          return MultisigERC.tokenBalances(acc1, tokemImperialSymbol, { from: acc1 });
      })
    .then(balance => {
        assert.equal(balance.valueOf(), 505, "505 should be the correct balance");
      })
  });

  it("With limit removed previously failing transaction should be ok", () => {

    let TokenERC;
    let TokenAddress;
    let MultisigERC;
    let MultisigAddress;

    return FirstERC.deployed()
    .then(instance => { 
      TokenERC = instance;
      TokenAddress = TokenERC.address;
      return MultisigERC20.deployed();
    })
    .then(instance => {
        MultisigERC = instance;
        MultisigAddress = MultisigERC.address;
        MultisigERC.withdrawLimit(tokemImperialSymbol, '0xf61da422ae841422d87426f734d385a4c252d2abc2ba92fc0dc08a038247b8d15b9e7c5d51a9773345d91f1457174e7249958be894e2eee79982a6a9f7fd9dbd1b' , { from: acc1 });
      })
      .then(() => {
          MultisigERC.verifyTransaction__ef(acc1, 310, '0xe1bba28ea53fc32f8fedd2af18539a26fe48f1cff6fc5fcb49fd7742312966152990f481e387eeaeae94cb9f4adddbd380c17d0e9328b0b314bec8cf5ed9f1c91c', tokemImperialSymbol, { from: acc1 });
          return MultisigERC.tokenBalances(acc1, tokemImperialSymbol, { from: acc1 });
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 195, "195 should be the correct balance");
      })
  });

  it("Recovering funds to backup/safe address should fail if not enough time elapsed", () => {

    let MultisigERC;

    return MultisigERC20.deployed()
      .then(instance => {
        MultisigERC = instance;
        MultisigERC.depositFunds_xur(tokemImperialSymbol, 50, { from: acc1 });
        return MultisigERC.safetyKeys.call(acc1, tokemImperialSymbol);
      })
      .then(safetyPublickey => {
        assert.equal(safetyPublickey, acc2, "Safety public key is not correct");
      }) 
      .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.recoverFundsToSafeAddress(acc1, acc2, tokemImperialSymbol, 5, { from: acc1 }), "Not enough time elapsed to recover to backup address"
        );
      });
  });

  it("Recovering funds to backup/safe address should fail if wrong backup address presented", () => {

    let MultisigERC;

    return MultisigERC20.deployed()
      .then(instance => {
        MultisigERC = instance;
        return MultisigERC.safetyKeys.call(acc1, tokemImperialSymbol);
      })
      .then(safetyPublickey => {
        assert.equal(safetyPublickey, acc2, "Safety public key is not correct");
      }) 
      .then(async () => {
        await zeppelin.time.increase(121);
        await zeppelin.expectRevert(
        MultisigERC.recoverFundsToSafeAddress(acc1, acc1, tokemImperialSymbol, 5, { from: acc1 }), 
        "Address is not correct"
        );
      })
  });

  it("Recovering funds to backup/safe address should fail if amount requested exceeds balance", () => {

    let MultisigERC;

    return MultisigERC20.deployed()
      .then(instance => {
        MultisigERC = instance;
        return MultisigERC.safetyKeys.call(acc1, tokemImperialSymbol);
      })
      .then(safetyPublickey => {
        assert.equal(safetyPublickey, acc2, "Safety public key is not correct");
      }) 
      .then(async () => {
        await zeppelin.time.increase(121);
        await zeppelin.expectRevert(
        MultisigERC.recoverFundsToSafeAddress(acc1, acc1, tokemImperialSymbol, 500, { from: acc1 }), 
        "Not enough balance"
        );
      })
  });

  it("Recovering funds to backup/safe address should work if enough time elapsed", () => {

    let MultisigERC;

    return MultisigERC20.deployed()
      .then(instance => {
        MultisigERC = instance;
        MultisigERC.depositFunds_xur(tokemImperialSymbol, 50, { from: acc1 });
        return MultisigERC.safetyKeys.call(acc1, tokemImperialSymbol);
      })
      .then(safetyPublickey => {
        assert.equal(safetyPublickey, acc2, "Safety public key is not correct");
      }) 
      .then(async () => {
        await zeppelin.time.increase(121);
        MultisigERC.recoverFundsToSafeAddress(acc1, acc2, tokemImperialSymbol, 5, { from: acc1 });
        return MultisigERC.tokenBalances(acc1, tokemImperialSymbol, { from: acc1 });
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 290, "290 should be the correct balance");
      });
  });

  it("Recovering funds to any address should fail if not enough time elapsed", () => {

    let MultisigERC;

    return MultisigERC20.deployed()
      .then(instance => {
        MultisigERC = instance;
        MultisigERC.depositFunds_xur(tokemImperialSymbol, 50, { from: acc1 });
        return MultisigERC.safetyKeys.call(acc1, tokemImperialSymbol);
      })
      .then(safetyPublickey => {
        assert.equal(safetyPublickey, acc2, "Safety public key is not correct");
      }) 
      .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.recoverFunds(acc1, acc1, tokemImperialSymbol, 5, { from: acc1 }), "Not enough time elapsed to recover to any address"
        );
      });
  });

  it("Recovering funds to any address should fail if amount requested exceeds balance", () => {

    let MultisigERC;

    return MultisigERC20.deployed()
      .then(instance => {
        MultisigERC = instance;
      }) 
      .then(async () => {
        await zeppelin.time.increase(301);
        await zeppelin.expectRevert(
        MultisigERC.recoverFunds(acc1, acc1, tokemImperialSymbol, 500, { from: acc1 }), 
        "Not enough balance"
        );
      })
  });

  it("Recovering funds to any address should work if enough time elapsed", () => {

    let MultisigERC;

    return MultisigERC20.deployed()
      .then(instance => {
        MultisigERC = instance;
        MultisigERC.depositFunds_xur(tokemImperialSymbol, 50, { from: acc1 });
        return MultisigERC.safetyKeys.call(acc1, tokemImperialSymbol);
      })
      .then(safetyPublickey => {
        assert.equal(safetyPublickey, acc2, "Safety public key is not correct");
      }) 
      .then(async () => {
        await zeppelin.time.increase(301);
        MultisigERC.recoverFunds(acc1, acc1, tokemImperialSymbol, 5, { from: acc1 });
        return MultisigERC.tokenBalances(acc1, tokemImperialSymbol, { from: acc1 });
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 385, "385 should be the correct balance");
      });
  });

  it("When the limit is set multiple transaction below the limit should succeed", () => {

    let MultisigERC;

    return MultisigERC20.deployed()
      .then(instance => {
        MultisigERC = instance;
        MultisigERC.setDailyLimit(tokemImperialSymbol, 5000, '0x2b40b98fbb82c5c4485acf74083db1f2896ffbfcd69e7d27458c0a5d1b8eff0b465fdd35be0d2ed8ca701daa51e47c7dea0448a591da5f34604348f66857f7f41b' , { from: acc1 });
        return MultisigERC.tokenBalances(acc1, tokemImperialSymbol, { from: acc1 });
      })
      .then(async (balance) => {
        assert.equal(balance.valueOf(), 385, "385 should be the correct balance");
        await MultisigERC.verifyTransaction__ef(acc1, 10, '0xfc7c082093dd4f1d7c1c7b02da702fde8c53a71e5e50cbbbcc5e713920a4074b033bf53fe5b0ae1fabc025523ce68193e840ecf921742078b589936e12c3d0911b', tokemImperialSymbol, { from: acc1 });
        return MultisigERC.tokenBalances(acc1, tokemImperialSymbol, { from: acc1 });
      })
      .then((balance) => {
        assert.equal(balance.valueOf(), 375, "375 should be the correct balance");
        MultisigERC.verifyTransaction__ef(acc1, 10, '0x643afffe4f2d974d6f97ea02750b284e6c49e04545f90e154273c8e97da60d677d0681bf8d2edc38e552e02e9b0a4d8c83f02b94307a8f52e9ac1e97febac4de1b', tokemImperialSymbol, { from: acc1 });
        return MultisigERC.tokenBalances(acc1, tokemImperialSymbol, { from: acc1 });
      })
      .then(balance => {
        assert.equal(balance.valueOf(), 365, "365 should be the correct balance");
      });
  });


  it("When the limit is set multiple transactions breaking the limit should fail", () => {

    let TokenERC;
    let MultisigERC;
    let MultisigAddress;

    return FirstERC.deployed()
      .then(instance => { 
        TokenERC = instance;
        return MultisigERC20.deployed();
      })
      .then(instance => {
        MultisigERC = instance;
        MultisigAddress = MultisigERC.address;
        TokenERC.increaseAllowance(MultisigAddress, 6000, { from: acc1 });
      })
      .then(() => {
        MultisigERC.depositFunds_xur(tokemImperialSymbol, 6000, { from: acc1 });
      })
      .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.verifyTransaction__ef(
            acc1,
            6000, 
            '0x9be4af9f0f3e7fa7f220e5d5fedad896633827a766be8b8c4fc11766718b3ca4540d65d9ff179fc9899b8aaa90eb12c4926a2325769e478d9facf9b8627eef951b', 
            tokemImperialSymbol,   
            { from: acc1 }), 
          "Transaction amount exceeds daily limit"
        );
      })
  });

  it("Removing non-existent Token should fail", () => {

    let MultisigERC;

    MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
        
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.removeToken(
            incorrectToken, 
            { from: acc1 }), 
          "Can't remove 0 token"
        );
    })
  });

  it("Incorrectly signed tx should fail when setting daily limits", () => {

    let MultisigERC;

    MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
        
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.setDailyLimit(
            tokemImperialSymbol, 
            300, 
            incorrectSignature, 
            { from: acc1 }), 
          "Incorrect signature"
        );
    })
  });

  it("Incorrectly signed tx should fail when withrdawing daily limits", () => {

    let MultisigERC;

    MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
        
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.setDailyLimit(
            tokemImperialSymbol, 
            incorrectSignature, 
            { from: acc1 }), 
          "Incorrect signature"
        );
    })
  });

  it("Depositing to non-existent token should fail", () => {

    let MultisigERC;

    MultisigERC20.deployed()
    .then(instance => {
        MultisigERC = instance;
        
      })
    .then(async () => {
        await zeppelin.expectRevert(
          MultisigERC.depositFunds_xur(incorrectToken, 50, { from: acc1 }), 
          "Token not registered"
        );
    })
  });
 
});

