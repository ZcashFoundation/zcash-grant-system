pragma solidity ^0.4.24;
import "./PrivateFund.sol";

contract PrivateFundFactory {
    address[] privateFunds;

    event ContractCreated(address newAddress);

    function createPrivateFund (
        uint _raiseGoal,
        address _beneficiary,
        address[] _trustees,
        uint _quorum,
        address[] _boardMembers,
        uint[] _milestones,
        address _funder,
        bool _unanimityForRefunds
        ) public returns(address) {
        address newPrivateFundContract = new PrivateFund(
            _raiseGoal,
            _beneficiary,
            _trustees,
            _quorum,
            _boardMembers,
            _milestones,
            _funder,
            _unanimityForRefunds
        );
        emit ContractCreated(newPrivateFundContract);
        privateFunds.push(newPrivateFundContract);
        return newPrivateFundContract;
    }
}