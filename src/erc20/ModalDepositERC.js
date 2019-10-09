import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {ReceiptComponent, InitialTxHashComponent} from '../sharedComponents/sharedComponents.js';
import '../Modal.css';
var Tx = require('ethereumjs-tx').Transaction;

const ModalTrigger = ({handleSubmit, handleInputChange, errors}) => 
        <form id="DepositFormERC" onSubmit={handleSubmit}>
          <input type="text" name="amountDeposit" onChange={handleInputChange} className="smartInput2" placeholder="Amount"
            required pattern="\d+"/>
          <input type="text" name="privateKey" onChange={handleInputChange} className="smartInput2" placeholder="Private Key"
            required minLength="64" maxLength="64" pattern="\w+"/>  
          <button type="submit" className="smartButton">deposit token</button>
        </form>;
const ModalContent = ({closeModal, modalRef, onKeyDown, onClickAway, children}) => {
	return ReactDOM.createPortal(
		<aside className="c-modal-cover" onKeyDown={onKeyDown} onClick={onClickAway} tabIndex="0">
		  <div className="c-modal-safety" ref={modalRef}>
		    <button className="c-modal__close" onClick={closeModal}>
		      <svg className="c-modal__close-icon" viewBox="0 0 40 40"><path d="M 10,10 L 30,30 M 30,10 L 10,30"></path></svg>
		    </button>
		    <div className="c-modal__body">
		      {children}
		    </div>
		 </div>
		</aside>,
		document.body
	);
};

class ModalDepositERC extends React.Component {

  constructor(props) {
  	super(props);
  	this.state = {
      txHash: '',
      txReceipt: '',
      amountDeposit: '',
      privateKey: '',
  		isOpen: false,
      hashReceipt: false,
      confirmationReceipt:false
      }
  }

  handleInputChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;

    switch (name) {
    case 'amountDeposit': 
      if (event.target.validity.patternMismatch) {
        event.target.setCustomValidity("Please input a number");
      } else {
        event.target.setCustomValidity("");
      }  
      break;
    case 'privateKey':
      if (event.target.validity.tooShort) {
        event.target.setCustomValidity("Private key has to be 64 characters");
      } else if (event.target.validity.patternMismatch) {
        event.target.setCustomValidity("Only alphanumeric characters are allowed");
      } else {
        event.target.setCustomValidity("");
      } 
      break; 
    default:
      break;
    }
    this.setState({ [name]: value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.deposit(this.state.amountDeposit, this.state.privateKey);
    document.getElementById("DepositFormERC").reset();
  }
  
  openModal = () => {
	this.setState({ 
		isOpen: true, 
	  });
  };

  closeModal = () => {
  this.setState({ 
    isOpen: false, 
    });
  };

  onKeyDown = (event) => {
	return event.keyCode === 27 && this.closeModal();
  }
  
  onClickAway = (event) => {
	  if (this.modalNode && this.modalNode.contains(event.target)) return;
	  this.closeModal();
	};

  deposit = (amountDeposit, privateKey) => {
    let web3 = this.props.web3;
    let modal = this;
    let updateERCBalances = this.props.updateERCBalances;
    let multisigERC20Address = this.props.multisigERC20Address;
    let multisigERC20Token = this.props.multisigERC20Token;
    let tokenSymbol = this.props.tokenSymbol;
    const priv = Buffer.from(privateKey, 'hex');

    web3.eth.getTransactionCount(this.props.address, (err, txCount) => {
      // Build the transaction
        web3.eth.getGasPrice().then((gasPrice) => {
            multisigERC20Token.methods.depositFunds_xur(tokenSymbol, amountDeposit).estimateGas({gas: gasPrice, from: this.props.address}, function(error, gasAmount) {
                console.log('Current gas price: ', gasPrice);
                console.log('Estimate of gas usage: ', gasAmount);
                const txObject = {
                    nonce: web3.utils.toHex(txCount),
                    gasLimit: web3.utils.toHex(gasAmount),
                    gasPrice: web3.utils.toHex(gasPrice), 
                    to: multisigERC20Address,
                    data: multisigERC20Token.methods.depositFunds_xur(tokenSymbol, amountDeposit).encodeABI()
                };
                console.log(txObject);

                // Sign the transaction
                const tx = new Tx(txObject, { chain: 'ropsten', hardfork: 'petersburg' });
                tx.sign(priv);

                const serializedTransaction = tx.serialize();
                const rawTx = '0x' + serializedTransaction.toString('hex');
                
                console.log(rawTx);

                // Broadcast the transaction
                web3.eth.sendSignedTransaction(rawTx)
                .once('transactionHash', function(hash){ 
                    console.log('Hash of transaction: ', hash)
                    modal.setState({ 
                      txHash: hash,
                      hashReceipt: true,
                      confirmationReceipt: false                       
                    });
                    modal.openModal();
                })
                .once('confirmation', function(confNumber, receipt){ 
                    console.log('Transaction confirmation number: ', confNumber) 
                    console.log('Transaction receipt: ', receipt)
                    updateERCBalances();
                    modal.setState({ 
                      txReceipt: receipt,
                      confirmationReceipt: true, 
                      hashReceipt: false
                    });
                    modal.openModal(); 
                })
                .on('error', function(error){ console.log(error) });
            })
        })
    })
  } 

  render() {

  	return (
      <span>
       <ModalTrigger 
        handleSubmit={this.handleSubmit} 
        handleInputChange={this.handleInputChange}
        errors={this.state.errors}/>
       {
       	this.state.isOpen && 
       	<ModalContent 
       		closeModal={this.closeModal} 
       		onKeyDown={this.onKeyDown}
       		onClickAway={this.onClickAway}
       		modalRef={n => this.modalNode = n}> 
       		{this.state.hashReceipt ? 
            <InitialTxHashComponent transactionHash={this.state.txHash} />
            : null} 
          {this.state.confirmationReceipt ?
            <ReceiptComponent
              transactionHash={this.state.txReceipt.transactionHash}
              blockHash={this.state.txReceipt.blockHash}
              blockNumber={this.state.txReceipt.blockNumber}
              gasUsed={this.state.txReceipt.gasUsed}/>
            : null} 
          
       	</ModalContent>
       }
      </span>
    );
  }
}

export default ModalDepositERC;