import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '../Modal.css';

const ModalTrigger = ({handleSubmit, handleInputChange, errors}) => 
        <form id="AllowanceFormERC" onSubmit={handleSubmit}>
          <input type="text" name="ownerPub" onChange={handleInputChange} className="smartInput" placeholder="Owner Public Key"
            required minLength="42" maxLength="42" pattern="0x\w+"/> 
          <button type="submit" className="smartButton">check allowance</button>
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

class ModalTokenAllowance extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      allowance: '',
      ownerPub: '',
      isOpen: false,
      allowanceReceipt: false,
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
    this.checkAllowance(this.state.ownerPub, this.props.multisigERC20Address);
    document.getElementById("AllowanceFormERC").reset();
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

  checkAllowance = (ownerPub, multisigERC20Address) => {
    let modal = this;
    let token = this.props.token;
    console.log(ownerPub);
    console.log(multisigERC20Address);
    console.log(token.address);
    console.log(token);
    token.methods.allowance(ownerPub, multisigERC20Address).call({ from: ownerPub }).then( allowance => {

        modal.setState({ 
          allowance: allowance,
          allowanceReceipt: true
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
          {this.state.allowanceReceipt ? 
            <p className="modalTextTx">Current contract allowance is: {this.state.allowance}
            </p> 
            : null} 
          
        </ModalContent>
       }
      </span>
    );
  }
}

export default ModalTokenAllowance;