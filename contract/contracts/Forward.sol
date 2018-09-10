pragma solidity ^0.4.24;

contract Forward {
    address public destinationAddress;

    constructor(address _destinationAddress) public {
        destinationAddress = _destinationAddress;
    }

    function() public payable { }

    function payOut() public {
        destinationAddress.transfer(address(this).balance);
    }
}