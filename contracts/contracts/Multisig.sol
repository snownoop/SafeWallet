pragma solidity ^0.5.0;

import './ECDSA.sol';
import './SafeMath.sol';
// Verifying two signatures in one transcaction in this smart contract

contract Multisig {
    
    address private owner; 
    
    struct TimeLimits {
        uint256 dailyLimit;
        uint256 spent;
        uint256 timeStart;
        bool set;
    }
    
    mapping(address => uint256) public balances;
    mapping(address => uint256) public transactionNonces;
    mapping(address => uint256) private lastAppearance; 
    mapping(address => address) public safetyKeys; 
    mapping(address => TimeLimits) public limits; 
    
    constructor() public {
        owner = msg.sender;
    }
    
    function setDailyLimit(uint256 amount_, bytes memory signature_) public {
        bytes32 message = keccak256(abi.encodePacked(msg.sender, amount_, transactionNonces[msg.sender]));
        require(owner == ECDSA.recover(message, signature_) || safetyKeys[msg.sender] == ECDSA.recover(message, signature_), "Incorrect signature");
        limits[msg.sender].dailyLimit = amount_;
        limits[msg.sender].set = true;
        transactionNonces[msg.sender]++;
        lastAppearance[msg.sender] = block.timestamp; 
    }
    
    function withdrawLimit(bytes memory signature_) public {
        bytes32 message = keccak256(abi.encodePacked(msg.sender, transactionNonces[msg.sender]));
        require(owner == ECDSA.recover(message, signature_) || safetyKeys[msg.sender] == ECDSA.recover(message, signature_), "Incorrect signature");
        limits[msg.sender].dailyLimit = 0;
        limits[msg.sender].set = false;
        transactionNonces[msg.sender]++;
        lastAppearance[msg.sender] = block.timestamp; 
    }
    
    function deposit_CIx() 
        public 
        payable {
            balances[msg.sender] = SafeMath.add(balances[msg.sender], msg.value);
            lastAppearance[msg.sender] = block.timestamp; // Updating last time an action was taken by the user 
        }
        
    function deposit(address safetyKey) 
        public
        payable {
            require(balances[msg.sender] == 0, "Balance has to be zero"); // If there are funds in the account, safetyKey should not be overriden
            balances[msg.sender] = SafeMath.add(balances[msg.sender], msg.value);
            safetyKeys[msg.sender] = safetyKey;
            lastAppearance[msg.sender] = block.timestamp; // Updating last time an action was taken by the user 
    }    
    
    function verifyTransaction_26e
        (address payable to, uint256 amount, bytes memory signature) 
        public 
        {
            address from = msg.sender;
            require(balances[from] >= amount, "Not enough balance"); 
            bytes32 message = keccak256(abi.encodePacked(from, to, amount, transactionNonces[from]));
            require(owner == ECDSA.recover(message, signature) || safetyKeys[from] == ECDSA.recover(message, signature), "Incorrect signature"); // Check if the transaction was signed by the owner or safe key
            if (limits[from].set == true) {
                if (block.timestamp > limits[from].timeStart + 86400) {
                    require(amount <= limits[from].dailyLimit, "Transaction amount exceeds daily limit");
                    limits[from].timeStart = block.timestamp;
                } else {
                    require(SafeMath.add(limits[from].spent, amount) <= limits[from].dailyLimit, "Transaction amount exceeds daily limit");
                }
                limits[from].spent = SafeMath.add(limits[from].spent, amount);
            }
            balances[from] = SafeMath.sub(balances[from] ,amount);
            lastAppearance[msg.sender] = block.timestamp; // Updating last time an action was taken by the user 
            transactionNonces[from]++;
            to.transfer(amount);
        }
        
    function recoverFundsToSafeAddress(
        address from, 
        address payable to, 
        uint256 amount
        )
        public 
        {
            require(block.timestamp > lastAppearance[from] + 120, "Not enough time elapsed to recover to backup address"); //Testing that after two minues funds can be sent to safe address
            require(balances[from] >= amount, "Not enough balance");
            require(safetyKeys[from] == to, "Address is not correct");
            balances[from] = SafeMath.sub(balances[from] ,amount);
            to.transfer(amount);
        }
    
    function recoverFunds(
        address from, 
        address payable to, 
        uint256 amount
        )
        public
        {
            require(block.timestamp > lastAppearance[from] + 300, "Not enough time elapsed to recover to any address"); //Testing that after five minutes funds can be sent to anyone
            require(balances[from] >= amount, "Not enough balance");
            balances[from] = SafeMath.sub(balances[from] ,amount);
            to.transfer(amount);
        }
}


/* Old
pragma solidity ^0.5.0;

import './ECDSA.sol';
import './SafeMath.sol';
// Verifying two signatures in one transcaction in this smart contract

contract Multisig {
    
    address private owner; 
    
    struct TimeLimits {
        uint256 dailyLimit;
        uint256 spent;
        uint256 timeStart;
        bool set;
    }
    
    mapping(address => uint256) public balances;
    mapping(address => uint256) public transactionNonces;
    mapping(address => uint256) private lastAppearance; 
    mapping(address => address) public safetyKeys; 
    mapping(address => TimeLimits) private limits; 
    
    constructor() public {
        owner = msg.sender;
    }
    
    function setDailyLimit(uint256 amount_, bytes memory signature_) public {
        bytes32 message = keccak256(abi.encodePacked(msg.sender, amount_, transactionNonces[msg.sender]));
        require(owner == ECDSA.recover(message, signature_) || safetyKeys[msg.sender] == ECDSA.recover(message, signature_));
        limits[msg.sender].dailyLimit = SafeMath.add(limits[msg.sender].dailyLimit, amount_);
        limits[msg.sender].set = true;
        transactionNonces[msg.sender]++;
        lastAppearance[msg.sender] = block.timestamp; 
    }
    
    function withdrawLimit(bytes memory signature_) public {
        bytes32 message = keccak256(abi.encodePacked(msg.sender, transactionNonces[msg.sender]));
        require(owner == ECDSA.recover(message, signature_) || safetyKeys[msg.sender] == ECDSA.recover(message, signature_));
        limits[msg.sender].set = false;
        transactionNonces[msg.sender]++;
        lastAppearance[msg.sender] = block.timestamp; 
    }
    
    function deposit_CIx() 
        public 
        payable {
            balances[msg.sender] = SafeMath.add(balances[msg.sender], msg.value);
            lastAppearance[msg.sender] = block.timestamp; // Updating last time an action was taken by the user 
        }
        
    function deposit(address safetyKey) 
        public
        payable {
            require(balances[msg.sender] == 0); // If there are funds in the account, safetyKey should not be overriden
            balances[msg.sender] = SafeMath.add(balances[msg.sender], msg.value);
            safetyKeys[msg.sender] = safetyKey;
            lastAppearance[msg.sender] = block.timestamp; // Updating last time an action was taken by the user 
    }    
    
    function verifyTransaction_26e
        (address payable to, uint256 amount, bytes memory signature) 
        public 
        {
            address from = msg.sender;
            require(balances[from] >= amount); 
            bytes32 message = keccak256(abi.encodePacked(from, to, amount, transactionNonces[from]));
            require(owner == ECDSA.recover(message, signature) || safetyKeys[from] == ECDSA.recover(message, signature)); // Check if the transaction was signed by the owner or safe key
            if (limits[from].set == true) {
                if (block.timestamp > limits[from].timeStart + 86400) {
                    require(amount <= limits[from].dailyLimit, "Transaction amount exceeds daily limit");
                    limits[from].timeStart = block.timestamp;
                } else {
                    require(SafeMath.add(limits[from].spent, amount) <= limits[from].dailyLimit);
                }
                limits[from].spent = SafeMath.add(limits[from].spent, amount);
            }
            to.transfer(amount);
            balances[from] = SafeMath.sub(balances[from] ,amount);
            lastAppearance[msg.sender] = block.timestamp; // Updating last time an action was taken by the user 
            transactionNonces[from]++;
        }
        
    function recoverFundsToSafeAddress(
        address from, 
        address payable to, 
        uint256 amount
        )
        public 
        {
            require(block.timestamp > lastAppearance[from] + 120, "Not enough time elapsed to recover to backup address"); //Testing that after two minues funds can be sent to safe address
            require(balances[from] >= amount);
            require(safetyKeys[from] == to);
            to.transfer(amount);
            balances[from] = SafeMath.sub(balances[from] ,amount);
        }
    
    function recoverFunds(
        address from, 
        address payable to, 
        uint256 amount
        )
        public
        {
            require(block.timestamp > lastAppearance[from] + 300, "Not enough time elapsed to recover to any address"); //Testing that after five minutes funds can be sent to anyone
            require(balances[from] >= amount);
            to.transfer(amount);
            balances[from] = SafeMath.sub(balances[from] ,amount);
        }
}
*/
