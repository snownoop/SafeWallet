import React, { Component } from 'react';
import Web3 from 'web3';
import Tx from 'ethereumjs-tx';
import EthCrypto from 'eth-crypto';
import { MULTISIG_ABI, MULTISIG_ADDRESS, MULTISIG_ERC20_ABI, MULTISIG_ERC20_ADDRESS, ERC20_ABI, 
	TOKENIMPERIAL_ADDRESS, TOKENDEMOCRATIC_ADDRESS, TOKENIMPERIAL_SYMBOL, TOKENDEMOCRATIC_SYMBOL } from './config';
import SmartContract from './SmartContract'; 
import ERC20 from './erc20/ERC20';
import './css/ButtonGroup.css';


/* Validate forms, clear data in forms, check that transaction transfer works correctly*/ 
class BlockchainData extends Component {

	constructor(props) {
		super(props);
		this.state = {
			web3: '',
			multisig: '',
			etherAddress: '',
			etherBalance: '',
			tokenImperialBalance: '',
			tokenDemocraticBalance: '',
			contractBalance: '',
			tokenImperialContractBalance: '',
			tokenDemocraticContractBalance: '',
			Ethereum: true
		}
	}
	static getDerivedStateFromProps(props, state) {
    	return {etherAddress: props.etherAddress };
  	}

  	componentDidMount() {
  		const web3 = new Web3('https://ropsten.infura.io/v3/a33baa265ae340c29c82373e91533edf');
  		this.setState({ web3: web3 });
  		const multisig = new web3.eth.Contract(MULTISIG_ABI, MULTISIG_ADDRESS);
		this.setState({ multisig: multisig });
		const multisigERC20Token = new web3.eth.Contract(MULTISIG_ERC20_ABI, MULTISIG_ERC20_ADDRESS);
		this.setState({ multisigERC20Token: multisigERC20Token });
		const tokenImperial = new web3.eth.Contract(ERC20_ABI, TOKENIMPERIAL_ADDRESS);
		this.setState({ tokenImperial: tokenImperial });
		const tokenDemocratic = new web3.eth.Contract(ERC20_ABI, TOKENDEMOCRATIC_ADDRESS);
		this.setState({ tokenDemocratic: tokenDemocratic });
		web3.eth.getBalance(this.state.etherAddress, (error, balance) => {
			if (error) {
				console.log(error)
			} else {
		        this.setState({ etherBalance: balance });
	    		console.log('Account ether balance: ', this.state.etherBalance);
	    	}
			})
		multisigERC20Token.methods.tokenBalances(this.state.etherAddress, TOKENIMPERIAL_SYMBOL).call({from: this.state.etherAddress}, (error, balance) => {
			if (error) {
		        console.log(error)
		    } else {
		        this.setState({ tokenImperialContractBalance: balance });
		       	console.log('The imperial token contract balance of account is: ', this.state.tokenImperialContractBalance);
		    }
		})

		multisigERC20Token.methods.tokenBalances(this.state.etherAddress, TOKENDEMOCRATIC_SYMBOL).call({from: this.state.etherAddress}, (error, balance) => {
			if (error) {
		        console.log(error)
		    } else {
		        this.setState({ tokenDemocraticContractBalance: balance });
		       	console.log('The democratic token contract balance of account is: ', this.state.tokenDemocraticContractBalance);
		    }
		})

		multisig.methods.balances(this.state.etherAddress).call({from: this.state.etherAddress}, (error, balance) => {
		    if (error) {
		        console.log(error)
		    } else {
		        this.setState({ contractBalance: balance });
		       	console.log('The contract balance of account is: ', this.state.contractBalance);
		    }
		})

		tokenImperial.methods.balanceOf(this.state.etherAddress).call({from: this.state.etherAddress}, (error, balance) => {
		    if (error) {
		        console.log(error)
		    } else {
		        this.setState({ tokenImperialBalance: balance });
		       	console.log('The token Imperial balance of account is: ', this.state.tokenImperialBalance);
		    }
		})

		tokenDemocratic.methods.balanceOf(this.state.etherAddress).call({from: this.state.etherAddress}, (error, balance) => {
		    if (error) {
		        console.log(error)
		    } else {
		        this.setState({ tokenDemocraticBalance: balance });
		       	console.log('The token Democratic balance of account is: ', this.state.tokenDemocraticBalance);
		    }
		})

		//this.interval = setInterval(this.updateBalances, 15000);
		//this.interval = updateERCBalances(this.updateERCBalances, 15000);
  	}

  	componentWillUnmount() {
	   	clearInterval(this.interval);
	}

	updateBalances = () => {
  		let etherBalance = null;
  		let contractBalance = null
	    this.state.multisig.methods.balances(this.state.etherAddress).call({ from: this.state.etherAddress }, (error, balance) => {
        	if (error) {
	    		console.log(error);
	    	} else {
	    		contractBalance = balance;
	    		this.state.web3.eth.getBalance(this.state.etherAddress, (error, balance) => {
		  			if (error) {
		  				console.log(error, 'Something went wrong');
		  			} else {
						etherBalance = balance;
						console.log(etherBalance);
						console.log('Ether',etherBalance);
			      		this.setState({ contractBalance : contractBalance, etherBalance : etherBalance});
			      		console.log('New etherBalance : ', this.state.etherBalance);
			      		console.log('New contractBalance : ', this.state.contractBalance);
			      	}
			      }
			    );
	      	}
      	});
  	}
  	updateERCBalances = () => {
  		
  		this.state.tokenImperial.methods.balanceOf(this.state.etherAddress).call({from: this.state.etherAddress}, (error, balance) => {
		    if (error) {
		        console.log(error)
		    } else {
		        this.setState({ tokenImperialBalance: balance });
		       	console.log('The token Imperial balance of account is: ', this.state.tokenImperialBalance);
		    }
		})

		this.state.tokenDemocratic.methods.balanceOf(this.state.etherAddress).call({from: this.state.etherAddress}, (error, balance) => {
		    if (error) {
		        console.log(error)
		    } else {
		        this.setState({ tokenDemocraticBalance: balance });
		       	console.log('The token Democratic balance of account is: ', this.state.tokenDemocraticBalance);
		    }
		})

      	this.state.multisigERC20Token.methods.tokenBalances(this.state.etherAddress, TOKENIMPERIAL_SYMBOL).call({from: this.state.etherAddress}, (error, balance) => {
			if (error) {
		        console.log(error)
		    } else {
		        this.setState({ tokenImperialContractBalance: balance });
		       	console.log('The imperial token contract balance of account is: ', this.state.tokenImperialContractBalance);
		    }
		})

		this.state.multisigERC20Token.methods.tokenBalances(this.state.etherAddress, TOKENDEMOCRATIC_SYMBOL).call({from: this.state.etherAddress}, (error, balance) => {
			if (error) {
		        console.log(error)
		    } else {
		        this.setState({ tokenDemocraticContractBalance: balance });
		       	console.log('The democratic token contract balance of account is: ', this.state.tokenDemocraticContractBalance);
		    }
		})
  	}

  	onHandleClick = (e) => {
  		e.preventDefault();
  		var current = document.getElementsByClassName("active");
		current[0].className = current[0].className.replace(" active", "");
		e.target.className += " active";
		const name = e.target.name;

	    switch (name) {
	    case 'Ethereum': 
	      if (this.state.Ethereum != true) {
			this.setState({ 'Ethereum': true });
	      }
	      break;
	    case 'ERC20': 
	      if (this.state.Ethereum == true) {
			this.setState({ 'Ethereum': false });
	      }
	      break;   
	    default:
	      break;
	    }
  	}
  	
	render() {
  	  	return (
      		<div id="content" className ="smart">
      			<div className="btnGroup">
				  	<button className="buttonInGroup active" name="Ethereum" onClick={this.onHandleClick}>Ethereum</button>
				  	<button className="buttonInGroup" name="ERC20" onClick={this.onHandleClick}>ERC20</button>
      			</div>
      			{
      			this.state.Ethereum ? 
        		<SmartContract 
        			address={this.props.etherAddress} 
        			etherBalance={this.state.etherBalance}
        			contractBalance={this.state.contractBalance}
        			updateBalances={this.updateBalances}
        			web3={this.state.web3}
        			multisig={this.state.multisig} 
        			multisigAddress={MULTISIG_ADDRESS}/>
        		:
        		<ERC20 
        			web3={this.state.web3}
        			address={this.props.etherAddress} 
        			tokenImperialBalance={this.state.tokenImperialBalance}
        			tokenDemocraticBalance={this.state.tokenDemocraticBalance}
        			tokenImperial={this.state.tokenImperial}
        			tokenDemocratic={this.state.tokenDemocratic}
        			multisigERC20Address={MULTISIG_ERC20_ADDRESS}
        			multisigERC20Token={this.state.multisigERC20Token}
        			tokenDemocraticContractBalance={this.state.tokenDemocraticContractBalance}
        			tokenImperialContractBalance={this.state.tokenImperialContractBalance}
        			updateERCBalances={this.updateERCBalances}/>
        		}
      		</div>  
      	);
  }
}

export default BlockchainData;
