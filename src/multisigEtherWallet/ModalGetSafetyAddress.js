import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '../Modal.css';

const ModalTrigger = ({onHandleClick, handleInputChange}) => 
        <form id="SafetyForm" onSubmit={onHandleClick}>
          <input type="text" name="addressToCheck" onChange={handleInputChange} className="smartInput" placeholder="Account address" 
            required minLength="42" maxLength="42" pattern="0x\w+"/>
          <button type="submit" className="smartButton">safe address</button>
        </form>;
const ModalContent = ({toggle, modalRef, onKeyDown, onClickAway, children}) => {
	return ReactDOM.createPortal(
		<aside className="c-modal-cover" onKeyDown={onKeyDown} onClick={onClickAway} tabIndex="0">
		  <div className="c-modal-safety" ref={modalRef}>
		    <button className="c-modal__close" onClick={toggle}>
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

class ModalGetSafetyAddress extends React.Component {

  constructor(props) {
  	super(props);
  	this.state = {
      addressToCheck: '',
      address: '',
      safetyAddress: '',
  		isOpen: false
    }
  }
  static getDerivedStateFromProps(props, state) {
    return {address: props.address };
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    switch (name) {
    case 'addressToCheck':
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

    this.setState({
      [name]: value
    });
  }

  onHandleClick = (event) => {
    event.preventDefault();
    
    this.props.multisig.methods.safetyKeys(this.state.addressToCheck).call({ from: this.state.address }, (error, safetyAddress) => {
      if (error) {
        console.log(error);
      } else {
        console.log(safetyAddress);
        document.getElementById("SafetyForm").reset();
        this.setState({ safetyAddress: safetyAddress});
        this.toggle();
      }
    });
    
  }

  toggle = () => {
	this.setState({ 
		isOpen: !this.state.isOpen, 
	  });
  };

  onKeyDown = (event) => {
	return event.keyCode === 27 && this.toggle();
  }
  
  onClickAway = (event) => {
	  if (this.modalNode && this.modalNode.contains(event.target)) return;
	  this.toggle();
	};

  render() {

  	return (
      <span>
       <ModalTrigger 
        onHandleClick={this.onHandleClick}
        handleInputChange={this.handleInputChange}/>
       {
       	this.state.isOpen && 
       	<ModalContent 
       		toggle={this.toggle} 
       		onKeyDown={this.onKeyDown}
       		onClickAway={this.onClickAway}
       		modalRef={n => this.modalNode = n}> 
       		<p className="modalText">Your current safety address is: <br/>{this.state.safetyAddress}</p> 
       	</ModalContent>
       }
      </span>
    );
  }
}

export default ModalGetSafetyAddress;