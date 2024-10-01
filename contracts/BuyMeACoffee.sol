// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract BuyMeACoffee {
    //Memo struct.
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    //Event for a new memo; emitted when a memo is created
    event newMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    // List of all the memos we got
    Memo[] memos;

    address payable owner;

    // Assigns the address who deploys the contract as owner; Runs only once at the time of deployment
    constructor() {
        owner = payable(msg.sender);
    }

    /**
     * @dev function to buy a coffee for the owner
     * @param _name name of the coffee buyer
     * @param _message a nice message for the owner
     */
    function buyCoffee(
        string memory _name,
        string memory _message
    ) public payable {
        require(msg.value > 0, "Can't buy coffee with 0 ETH");

        // Add a new memo struct and then push it to the memos array
        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        // Emit a log event when a new memo is created
        emit newMemo(msg.sender, block.timestamp, _name, _message);
    }

    /**
     * @dev function to send tips to the owner of this contract
     */
    function withdrawCoffee() public {
        require(msg.sender == owner, "Oops! Only the owner can withdraw tips.");
        require(owner.send(address(this).balance));
    }

    /**
     * @dev function to retrieve all the memos stored on the blockchain
     */
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}
