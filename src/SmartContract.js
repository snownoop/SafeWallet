import React, { Component } from 'react';
import './Smart.css';
import ModalDeposit from './multisigEtherWallet/ModalDeposit.js';
import ModalDepositSafely from './multisigEtherWallet/ModalDepositSafely.js';
import ModalToken from './ModalToken';
import ModalGetSafetyAddress from './multisigEtherWallet/ModalGetSafetyAddress.js';
import ModalTransferSafetyKey from './multisigEtherWallet/ModalTransferSafetyKey.js';
import ModalTransferToken from './multisigEtherWallet/ModalTransferToken.js';
import ModalSetLimit from './multisigEtherWallet/ModalSetLimit.js';
import ModalWithdrawLimit from './multisigEtherWallet/ModalWithdrawLimit.js';
import ModalRecoverFundsSafely from './multisigEtherWallet/ModalRecoverFundsToSafeAddr.js';
import ModalRecoverFunds from './multisigEtherWallet/ModalRecoverFunds.js';
import ModalCheckDailyLimit from './multisigEtherWallet/ModalCheckDailyLimit.js';

class SmartContract extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
           depositOptions: false,
           dailyLimitOptions: false,
           transactionOptions: false,
           recoveryOptions: false,
           safetyFeatures: false
	    }
  	};

    handleClick = (e) => {
        e.preventDefault();
        const name = e.target.name;
        this.setState({ [name]: !this.state[name] });
        let options = ['depositOptions', 'dailyLimitOptions', 'transactionOptions', 'recoveryOptions', 'safetyFeatures'];
        for (let i = 0; i < 5; i++) {
            if (options[i] != name) {
                this.setState({ [options[i]]: false });
            }
        }
    }

  	render() {

    return (
      <div>
        <p className="smartP"> Your address: {this.props.address}</p>
        <p className="smartP"> Ether balance (wei): {this.props.etherBalance}</p>
        <p className="smartP"> Contract balance (wei): {this.props.contractBalance}</p>
        <button className="smartButtonLong" name= "depositOptions" onClick={this.handleClick}>deposit options</button>
        {
        this.state.depositOptions ? 
        <React.Fragment>       
        <ModalDeposit 
            web3={this.props.web3} 
            address={this.props.address} 
            multisig={this.props.multisig}
            multisigAddress={this.props.multisigAddress}
            updateBalances={this.props.updateBalances} />
        <ModalDepositSafely
            web3={this.props.web3} 
            address={this.props.address} 
            multisig={this.props.multisig}
            multisigAddress={this.props.multisigAddress}
            updateBalances={this.props.updateBalances} />
        </React.Fragment>
        : null
        }               
        <button className="smartButtonLong" name= "dailyLimitOptions" onClick={this.handleClick}>dailt limit management</button>
        {
        this.state.dailyLimitOptions ? 
        <React.Fragment>       
        <ModalSetLimit
            web3={this.props.web3} 
            address={this.props.address} 
            multisig={this.props.multisig}
            multisigAddress={this.props.multisigAddress}
            updateBalances={this.props.updateBalances} />
        <ModalWithdrawLimit
            web3={this.props.web3} 
            address={this.props.address} 
            multisig={this.props.multisig}
            multisigAddress={this.props.multisigAddress}
            updateBalances={this.props.updateBalances} />
        <ModalCheckDailyLimit
            multisig={this.props.multisig} />    
        </React.Fragment>
        : null
        }      
        <button className="smartButtonLong" name= "transactionOptions" onClick={this.handleClick}>transaction options</button>
        {
        this.state.transactionOptions ? 
        <React.Fragment>       
        <ModalTransferSafetyKey 
        	web3={this.props.web3} 
        	address={this.props.address} 
        	multisig={this.props.multisig}
        	multisigAddress={this.props.multisigAddress}
        	updateBalances={this.props.updateBalances} />
        <ModalTransferToken 
            web3={this.props.web3} 
            address={this.props.address} 
            multisig={this.props.multisig}
            multisigAddress={this.props.multisigAddress}
            updateBalances={this.props.updateBalances} />
        </React.Fragment>
        : null
        }  
        <button className="smartButtonLong" name= "recoveryOptions" onClick={this.handleClick}>recovery options</button>
        {
        this.state.recoveryOptions ? 
        <React.Fragment>
        <ModalRecoverFundsSafely
            web3={this.props.web3} 
            address={this.props.address} 
            multisig={this.props.multisig}
            multisigAddress={this.props.multisigAddress}
            updateBalances={this.props.updateBalances}/>
        <ModalRecoverFunds
            web3={this.props.web3} 
            address={this.props.address} 
            multisig={this.props.multisig}
            multisigAddress={this.props.multisigAddress}
            updateBalances={this.props.updateBalances}/>              	
        </React.Fragment>
        : null
        }
        <button className="smartButtonLong" name= "safetyFeatures" onClick={this.handleClick}>safety features</button>
        {
        this.state.safetyFeatures ? 
        <React.Fragment>
        <ModalToken 
            address={this.props.address}
            web3={this.props.web3} />
        <ModalGetSafetyAddress 
            address={this.props.address} 
            multisig={this.props.multisig} />               
        </React.Fragment>
        : null
        }
      </div>         
      );
  }
}

export default SmartContract;
