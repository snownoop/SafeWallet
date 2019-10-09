pragma solidity ^0.5.0;

import './ECDSA.sol';
import "./FirstERC.sol";
import "./SafeMath.sol";

contract MultisigERC20 {
    
    struct TimeLimits {
        uint256 dailyLimit;
        uint256 spent;
        uint256 timeStart;
        bool set;
    }    
        
    address private owner;
    FirstERC public ERC20Interface; // required to communicate with tokens complying to ERC20 standard 
    mapping(bytes32 => address) public tokens; // mapping of tokens suppoted by the smart contract 
    mapping(address => mapping(bytes32 => uint256)) public tokenBalances; // mapping of token balances for every user    
    mapping(address => uint256) public transactionNonces; // amount of transactions for every user in this smart contract
    mapping(address => mapping(bytes32 => address)) public safetyKeys; // make private when tested
    mapping(address => mapping(bytes32 => TimeLimits)) public limits; 
    mapping(address => uint256) private lastAppearance; // Private to make it harder for malicious users.
    
    modifier onlyOwner { 
      require(msg.sender == owner);
      _;
    }
    
    constructor() public {
        owner = msg.sender;
    }
    
    // Used to add support for new tokens
    function addNewToken (bytes32 symbol_, address address_) 
        public 
        onlyOwner 
        returns (bool) {  
        tokens[symbol_] = address_;  
      
        return true;  
    }  
      
    // Removing tokens not supported by dapp
    function removeToken(bytes32 symbol_) 
        public
        onlyOwner 
        returns (bool) {  
      require(tokens[symbol_] != address(0), "Can't remove 0 token");  
      
      delete(tokens[symbol_]);  
      
      return true;  
    }  
    
    function setDailyLimit(bytes32 symbol_, uint256 amount_, bytes memory signature_) public {
        bytes32 message = keccak256(abi.encodePacked(msg.sender, symbol_, amount_, transactionNonces[msg.sender]));
        require(owner == ECDSA.recover(message, signature_) || safetyKeys[msg.sender][symbol_] == ECDSA.recover(message, signature_), "Incorrect signature"); 
        limits[msg.sender][symbol_].dailyLimit = amount_;
        limits[msg.sender][symbol_].set = true;
        transactionNonces[msg.sender]++;
        lastAppearance[msg.sender] = block.timestamp; // Updating last time an action was taken by the user 
    }
    
    function withdrawLimit(bytes32 symbol_, bytes memory signature_) public {
        bytes32 message = keccak256(abi.encodePacked(msg.sender, symbol_, transactionNonces[msg.sender]));
        require(owner == ECDSA.recover(message, signature_) || safetyKeys[msg.sender][symbol_] == ECDSA.recover(message, signature_), "Incorrect signature"); 
        limits[msg.sender][symbol_].dailyLimit = 0;
        limits[msg.sender][symbol_].set = false;
        transactionNonces[msg.sender]++;
        lastAppearance[msg.sender] = block.timestamp; // Updating last time an action was taken by the user 
    }
     
    function depositFunds_xur(bytes32 symbol_, uint256 amount_) public returns (bool) {
        require(tokens[symbol_] != address(0), "Token not registered");  
          
        address contract_ = tokens[symbol_];  
        address from_ = msg.sender;  
         
        ERC20Interface = FirstERC(contract_);  
        
        require(amount_ <= ERC20Interface.allowance(from_, address(this)), "Amount is larger than provided allowance");

        ERC20Interface.transferFrom(from_, address(this), amount_);  
        
        tokenBalances[from_][symbol_] = SafeMath.add(tokenBalances[from_][symbol_], amount_);
        lastAppearance[msg.sender] = block.timestamp;
        return true;
    }
    
    function depositFunds(address safetyKey_, bytes32 symbol_, uint256 amount_) public returns (bool) {
        require(tokenBalances[msg.sender][symbol_] == 0, "Balance is not zero"); // Registration allowed if there is no token balance for the user
        require(tokens[symbol_] != address(0), "Token not registered");   
          
        address contract_ = tokens[symbol_];  
        address from_ = msg.sender;  
         
        ERC20Interface = FirstERC(contract_);  
        
        require(amount_ <= ERC20Interface.allowance(from_, address(this)), "Amount is larger than provided allowance");

        ERC20Interface.transferFrom(from_, address(this), amount_);  
        
        tokenBalances[from_][symbol_] = SafeMath.add(tokenBalances[from_][symbol_], amount_);
        safetyKeys[msg.sender][symbol_] = safetyKey_; // Registering backup key
        lastAppearance[msg.sender] = block.timestamp;
        return true;
    }
     
    
    function verifyTransaction__ef
        (
        address to,
        uint256 amount, 
        bytes memory signature,
        bytes32 symbol_
        ) 
        public 
        {
            address from = msg.sender;
            require(tokenBalances[from][symbol_] >= amount, "Not enough balance"); 
            bytes32 message = keccak256(abi.encodePacked(from, to, amount, transactionNonces[from], symbol_));
            require(owner == ECDSA.recover(message, signature) || safetyKeys[from][symbol_] == ECDSA.recover(message, signature), "Incorrect signature"); // Check if the transaction was signed by the owner or safe key
            if (limits[from][symbol_].set == true) {
                if (block.timestamp > limits[from][symbol_].timeStart + 86400) {
                    require(amount <= limits[from][symbol_].dailyLimit, "Transaction amount exceeds daily limit");
                    limits[from][symbol_].timeStart = block.timestamp;
                } else {
                    require(SafeMath.add(limits[from][symbol_].spent, amount) <= limits[from][symbol_].dailyLimit, "Transaction amount exceeds daily limit");
                }
                limits[from][symbol_].spent = SafeMath.add(limits[from][symbol_].spent, amount);
            }
            address contract_ = tokens[symbol_];  

            ERC20Interface = FirstERC(contract_);
            tokenBalances[from][symbol_] = SafeMath.sub(tokenBalances[from][symbol_] ,amount);
            lastAppearance[msg.sender] = block.timestamp; // Updating last time an action was taken by the user 
            transactionNonces[from]++;
            ERC20Interface.transfer(to, amount);
        }
    
    function recoverFundsToSafeAddress(address from_, address to_, bytes32 symbol_, uint256 amount_) public {
        require(block.timestamp > lastAppearance[from_] + 120, "Not enough time elapsed to recover to backup address"); //Testing that after two minutes funds can be sent to safe address
        require(tokenBalances[from_][symbol_] >= amount_, "Not enough balance");
        require(safetyKeys[from_][symbol_] == to_, "Address is not correct");
        address contract_ = tokens[symbol_];  
        ERC20Interface = FirstERC(contract_);
        tokenBalances[from_][symbol_] = SafeMath.sub(tokenBalances[from_][symbol_] ,amount_);
        ERC20Interface.transfer(to_, amount_);
    }
    
    function recoverFunds(address from_, address to_, bytes32 symbol_, uint256 amount_) public {
        require(block.timestamp > lastAppearance[from_] + 300, "Not enough time elapsed to recover to any address"); //Testing that after five minutes funds can be sent to anyone
        require(tokenBalances[from_][symbol_] >= amount_, "Not enough balance");
        address contract_ = tokens[symbol_];  
        ERC20Interface = FirstERC(contract_);
        tokenBalances[from_][symbol_] = SafeMath.sub(tokenBalances[from_][symbol_] ,amount_);
        ERC20Interface.transfer(to_, amount_);
    }
}