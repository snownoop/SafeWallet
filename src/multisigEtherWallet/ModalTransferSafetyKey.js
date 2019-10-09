import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {ReceiptComponent, InitialTxHashComponent} from '../sharedComponents/sharedComponents.js';
import '../Modal.css';
var Tx = require('ethereumjs-tx').Transaction;
var EthCrypto = require("eth-crypto");
var BigNumber = require('bignumber.js');

const ModalTrigger = ({handleSubmit, handleInputChange, errors}) => 
        <form id="TransferForm" onSubmit={handleSubmit}>
          <input type="text" name="amountToTransfer" onChange={handleInputChange} className="smartInput4" placeholder="Amount" 
            required pattern="\d+"/>
          <input type="text" name="recipientAddress" onChange={handleInputChange} className="smartInput4" placeholder="Recipient"
            required minLength="42" maxLength="42" pattern="0x\w+"/>
          <input type="text" name="privateKey" onChange={handleInputChange} className="smartInput4" placeholder="Private Key"
            required minLength="64" maxLength="64" pattern="\w+"/>
          <input type="text" name="safetyPrivateKey" onChange={handleInputChange} className="smartInput4" placeholder="Safety Key"
            required minLength="64" maxLength="64" pattern="\w+"/>
          <button type="submit" className="smartButton">Transfer Backup</button>
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

class ModalTransferSafetyKey extends React.Component {

  constructor(props) {
  	super(props);
  	this.state = {
      txHash: '',
      txReceipt: '',
      amountToTransfer: '',
      recipientAddress: '',
      privateKey: '',
      safetyPrivateKey: '',
  		isOpen: false,
      hashReceipt: false,
      confirmationReceipt:false
      }
  }

  handleInputChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;

    switch (name) {
    case 'amountToTransfer': 
      if (event.target.validity.patternMismatch) {
        event.target.setCustomValidity("Please input a number");
      } else {
        event.target.setCustomValidity("");
      }  
      break;
    case 'safetyPrivateKey':
    case 'privateKey':
      if (event.target.validity.tooShort) {
        event.target.setCustomValidity("Private key has to be 64 characters");
      } else if (event.target.validity.patternMismatch) {
        event.target.setCustomValidity("Only alphanumeric characters are allowed");
      } else {
        event.target.setCustomValidity("");
      }
      break;
    case 'recipientAddress':
      if (event.target.validity.tooShort) {
        event.target.setCustomValidity("Public key has to be 42 characters");
      } else if (event.target.validity.patternMismatch) {
        event.target.setCustomValidity("Public key has to start with '0x'");
      } else {
        event.target.setCustomValidity("");
      }     
    default:
      break;
    }

    this.setState({ [name]: value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.transfer(this.state.amountToTransfer, this.state.recipientAddress, this.state.privateKey, this.state.safetyPrivateKey);
    document.getElementById("TransferForm").reset();    
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

  transfer = (amountToTransfer, recipientAddress, privateKey, safetyPrivateKey) => {

    let web3 = this.props.web3;
    let multisig = this.props.multisig;
    let multisigAddress = this.props.multisigAddress;
    let modal = this;
    let updateBalances = this.props.updateBalances;
    let addrFrom = this.props.address;
    const priv = Buffer.from(privateKey, 'hex');
    BigNumber.set({ DECIMAL_PLACES: 18 }) // We need it to convert large wei inputs

    // Getting Ethereum transaction count
    web3.eth.getTransactionCount(addrFrom, (err, txCount) => {
      // Retrieving the current nonce inside the contract
      multisig.methods.transactionNonces(addrFrom).call({from: addrFrom}, (error, nonce) => {
            if (error) {
                console.log(error)
            } else {
                
                // The next few lines go around issues with big numbers
                let x = new BigNumber(amountToTransfer);
                let val = web3.utils.fromWei(x.toString(10), 'ether');
                let value = web3.utils.toWei(val.toString(), 'ether');
                
                let msg = [
                  { type: "address", value: addrFrom},
                  { type: "address", value: recipientAddress},
                  { type: "uint256", value: value},
                  { type: "uint256", value: nonce.toString()}
                ];

                console.log(msg);
                const _message = EthCrypto.hash.keccak256(msg); 
                console.log(`message: ${_message}`);
                
                const _signature = EthCrypto.sign(safetyPrivateKey, _message);

                console.log(`signature: ${_signature}`);
                // Build the transaction
                web3.eth.getGasPrice().then((gasPrice) => {
                    console.log('Current gas price: ', gasPrice);    
                    multisig.methods.verifyTransaction_26e(recipientAddress, value, _signature).estimateGas({gas: gasPrice, from: addrFrom}, function(error, gasAmount) {
                        if (error) {
                            console.log(error);
                            
                        } else {
                        console.log('Estimate of gas usage: ', gasAmount);
                        
                        const txObject = {
                            nonce: web3.utils.toHex(txCount),
                            gasLimit: web3.utils.toHex(gasAmount), // For testing, so transactions accepted faster
                            gasPrice: web3.utils.toHex(gasPrice),
                            to: multisigAddress,
                            data: multisig.methods.verifyTransaction_26e(recipientAddress, value, _signature).encodeABI()
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
                            console.log('Hash of transaction: ', hash);
                            modal.setState({ 
                              txHash: hash,
                              hashReceipt: true,
                              confirmationReceipt: false                       
                            });
                            modal.openModal();
                        })
                        .once('confirmation', function(confNumber, receipt){ 
                            console.log('Transaction confirmation number: ', confNumber);
                            console.log('Second receipt of transaction: ', receipt);
                            updateBalances();
                    
                            modal.setState({ 
                              txReceipt: receipt,
                              confirmationReceipt: true, 
                              hashReceipt: false
                            });
                            modal.openModal(); 
                        })
                        .on('error', function(error){ console.log(error) });
                        
                        }
                    })
                })
            }
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

export default ModalTransferSafetyKey;