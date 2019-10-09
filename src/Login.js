import React, { Component } from 'react';
import './Smart.css';

class Login extends React.Component {

  constructor(props) {
  	super(props);
  	this.state = {
 		address: null,
 		errors: {
 			address: ''
 		},
 		typed: false
    }
  }

  handleInputChange = (event) => {
  	event.preventDefault();
    const { name, value } = event.target;

    let errors = this.state.errors;

    switch (name) {
	  case 'address': 
	    if (value.length != 42) {
	      errors.address = 'Address must be 42 characters long';
	  	} else if (value.charAt(0) != '0' || value.charAt(1) != 'x') {
	  	  errors.address = 'Address must start with 0x';
	  	} else {
	      errors.address = '';
	  	}
	    break;
	  default:
	    break;
	}

  	this.setState({errors, [name]: value, typed:true});
  }

  handleSubmit = (event) => {
  	event.preventDefault();
  	if(this.state.errors.address.length == 0 && this.state.typed == true) {
      this.props.setAddress(this.state.address);
  	}else{
      console.error('Invalid Form');
  	}
  }

  setAddress = () => {
  	this.props.setAddress(this.state.address);
  }

  render() {
  	const {errors} = this.state;
  	return (
		<div id="login" className="smartLogin">
		  <form onSubmit={this.handleSubmit}>
			  <p className="smartPLogin">Please enter your Ethereum Address:</p>
			  <input type="text" name="address" onChange={this.handleInputChange} className="smartInputLogin" placeholder="Ethereum Address"/>
			  {errors.address.length > 0 && 
                <span className='error'>{errors.address}</span>}
	      <button type="submit" className="smartButtonLogin">Login</button>
		  </form>
		</div>
	);
  }
}

export default Login;