import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '../Modal.css';

const ModalTrigger = ({handleSubmit, handleInputChange, errors}) => 
        <form id="CheckDailyLimitERC" onSubmit={handleSubmit}>
          <input type="text" name="ownerPub" onChange={handleInputChange} className="smartInput" placeholder="Owner Public Key"
            required minLength="42" maxLength="42" pattern="0x\w+"/> 
          <button type="submit" className="smartButton">check daily limit</button>
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

class ModalCheckDailyLimit extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      limit: '',
      ownerPub: '',
      isOpen: false,
      dailyLimitReceipt: false,
      }
  }

  handleInputChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;

    switch (name) {
    case 'ownerPub':
      if (event.target.validity.tooShort) {
        event.target.setCustomValidity("Public key has to be 42 characters");
      } else if (event.target.validity.patternMismatch) {
        event.target.setCustomValidity("Public key has to start with '0x'");
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
    this.checkLimit(this.state.ownerPub, this.props.tokenSymbol);
    document.getElementById("CheckDailyLimitERC").reset();
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

  checkLimit = (ownerPub) => {
    let modal = this;
    let multisig = this.props.multisig;
    multisig.methods.limits(ownerPub).call({ from: ownerPub }).then( limit => {

        modal.setState({ 
          limit: limit.dailyLimit,
          dailyLimitReceipt: true
        });
        modal.openModal();
      }
    )
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
          {this.state.dailyLimitReceipt ? 
            <p className="modalTextTx">Current Ether limit is: {this.state.limit}
            </p> 
            : null} 
          
        </ModalContent>
       }
      </span>
    );
  }
}

export default ModalCheckDailyLimit;