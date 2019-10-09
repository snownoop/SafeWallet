import React, { Component } from 'react';
import '../Smart.css';
import ModalTokenAllowance from './ModalTokenAllowance.js'; 
import ModalAllowance from './ModalAllowance.js';
import ModalDepositERC from './ModalDepositERC.js';
import ModalTransferERCToken from './ModalTransferERCToken.js';
import ModalTransferERCSafely from './ModalTransferERCSafely.js';
import ModalDepositERCSafely from './ModalDepositERCSafely.js';
import ModalToken from '../ModalToken.js'; 
import ModalERCSafetyAddress from './ModalERCSafetyAddress.js';
import ModalERCSetLimit from './ModalERCSetLimit.js';
import ModalERCWithdrawLimit from './ModalERCWithdrawLimit.js';
import ModalRecoverERCSafely from './ModalRecoverERCSafely.js';
import ModalRecoverERC from './ModalRecoverERC.js';
import ModalCheckDailyLimitERC from './ModalCheckDailyLimitERC.js';

class ERC20 extends Component {
	constructor(props) {
	    super(props);
	    this.state = {
	       chosenTokenBalance: 'tokenImperialBalance',
           chosenToken: this.props.tokenImperial,
           chosenTokenSymbol: '0x746f6b656e496d70657269616c00000000000000000000000000000000000000',
           chosenTokenContractBalance: 'tokenImperialContractBalance',
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

    handleChange = (event) => {

        console.log(event.target.value);
        let tokenName = event.target.value;
        this.setState({
            chosenTokenBalance: event.target.value,
        })
        switch(tokenName) {
            case 'tokenImperialBalance':
                this.setState({
                    chosenToken: this.props.tokenImperial,
                    chosenTokenSymbol: '0x746f6b656e496d70657269616c00000000000000000000000000000000000000', // Sets the token symbol to Imperial
                    chosenTokenContractBalance: 'tokenImperialContractBalance'
                });
                break;
            case 'tokenDemocraticBalance':
                this.setState({
                    chosenToken: this.props.tokenDemocratic,
                    chosenTokenSymbol: '0x746f6b656e44656d6f6372617469630000000000000000000000000000000000', // Sets the token symbol to Democratic
                    chosenTokenContractBalance: 'tokenDemocraticContractBalance'
                });
                break;
            default:
                break;
        }

    }

  	render() {

    return (
      <div>
        <p className="smartP"> Your address: {this.props.address}</p>
        <div className="smartDiv">
            <select name="tokens" className="smartSelect" onChange={this.handleChange}>
                <option value="tokenImperialBalance">Token Imperial</option>
                <option value="tokenDemocraticBalance">Token Democratic</option>
            </select>
        </div>
        <p className="smartP"> Your token balance on Ethereum: {this.props[this.state.chosenTokenBalance]}</p>
        <p className="smartP"> Your token contract balance: {this.props[this.state.chosenTokenContractBalance]}</p>
        <button className="smartButtonLong" name= "depositOptions" onClick={this.handleClick}>deposit options</button>
        {
        this.state.depositOptions ? 
        <React.Fragment>  
        <ModalTokenAllowance 
            multisigERC20Address={this.props.multisigERC20Address}
            token={this.state.chosenToken}
            web3={this.props.web3}
            address={this.props.address} />
        <ModalAllowance 
            multisigERC20Address={this.props.multisigERC20Address}
            token={this.state.chosenToken}
            address={this.props.address} />
        <ModalDepositERC 
            web3={this.props.web3}
            multisigERC20Address={this.props.multisigERC20Address}
            multisigERC20Token={this.props.multisigERC20Token}
            address={this.props.address}
            tokenSymbol={this.state.chosenTokenSymbol}
            updateERCBalances={this.props.updateERCBalances} />
        <ModalDepositERCSafely
            web3={this.props.web3}
            multisigERC20Address={this.props.multisigERC20Address}
            multisigERC20Token={this.props.multisigERC20Token}
            address={this.props.address}
            tokenSymbol={this.state.chosenTokenSymbol}
            updateERCBalances={this.props.updateERCBalances} />
        </React.Fragment>
        : null
        }
        <button className="smartButtonLong" name= "dailyLimitOptions" onClick={this.handleClick}>dailt limit management</button>
        {
        this.state.dailyLimitOptions ? 
        <React.Fragment>       
        <ModalERCSetLimit
            web3={this.props.web3}
            multisigERC20Address={this.props.multisigERC20Address}
            multisigERC20Token={this.props.multisigERC20Token}
            address={this.props.address}
            tokenSymbol={this.state.chosenTokenSymbol} />
        <ModalERCWithdrawLimit
            web3={this.props.web3}
            multisigERC20Address={this.props.multisigERC20Address}
            multisigERC20Token={this.props.multisigERC20Token}
            address={this.props.address}
            tokenSymbol={this.state.chosenTokenSymbol} />
        <ModalCheckDailyLimitERC
            multisigERC20Token={this.props.multisigERC20Token}
            tokenSymbol={this.state.chosenTokenSymbol} />
        </React.Fragment>
        : null
        }   
        <button className="smartButtonLong" name= "transactionOptions" onClick={this.handleClick}>transaction options</button>
        {
        this.state.transactionOptions ? 
        <React.Fragment>       
        <ModalTransferERCSafely
            web3={this.props.web3}
            multisigERC20Address={this.props.multisigERC20Address}
            multisigERC20Token={this.props.multisigERC20Token}
            address={this.props.address}
            tokenSymbol={this.state.chosenTokenSymbol}
            updateERCBalances={this.props.updateERCBalances} />
        <ModalTransferERCToken
            web3={this.props.web3}
            multisigERC20Address={this.props.multisigERC20Address}
            multisigERC20Token={this.props.multisigERC20Token}
            address={this.props.address}
            tokenSymbol={this.state.chosenTokenSymbol}
            updateERCBalances={this.props.updateERCBalances} />
        </React.Fragment>
        : null
        }    
        <button className="smartButtonLong" name= "recoveryOptions" onClick={this.handleClick}>recovery options</button>    
        {
        this.state.recoveryOptions ? 
        <React.Fragment>
        <ModalRecoverERCSafely         
            web3={this.props.web3}
            multisigERC20Address={this.props.multisigERC20Address}
            multisigERC20Token={this.props.multisigERC20Token}
            address={this.props.address}
            tokenSymbol={this.state.chosenTokenSymbol} 
            updateERCBalances={this.props.updateERCBalances} />  
        <ModalRecoverERC         
            web3={this.props.web3}
            multisigERC20Address={this.props.multisigERC20Address}
            multisigERC20Token={this.props.multisigERC20Token}
            address={this.props.address}
            tokenSymbol={this.state.chosenTokenSymbol} 
            updateERCBalances={this.props.updateERCBalances} />          
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
        <ModalERCSafetyAddress
            multisigERC20Token={this.props.multisigERC20Token}
            tokenSymbol={this.state.chosenTokenSymbol}
            address={this.props.address} />              
        </React.Fragment>
        : null
        }     
      </div>         
      );
  }
}

export default ERC20;
