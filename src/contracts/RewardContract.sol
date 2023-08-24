// SPDX-License-Identifier: MIT
// FOR JASON - this contract should be deployed seperately, is called by GithubStars

pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract RewardContract {

    address payable public owner;
    string public payloadCID;
    string public ieSpec;

    // Events for updating IE off-chain 
    event ImpactEvaluation(string LastEvaluation, address rewardee, uint amount);
    event PaymentReceived(address from, uint256 amount);


    constructor(string memory _specCID) payable {
        payloadCID = "not initialized";
        ieSpec = _specCID;
        owner = payable(msg.sender);
    }

    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }

    // Takes in rewardee address, reward amt and a CID indicating the evaluation calculation
    function rewardTransaction(address payable _rewardee, uint _amount, string memory _payloadCID) external {
        
        payloadCID = _payloadCID;

        // Make a transaction
        (bool success, )= _rewardee.call{value: _amount}("");
        require(success, "call failed");

        emit ImpactEvaluation(_payloadCID, _rewardee, _amount);
        
    }

}
