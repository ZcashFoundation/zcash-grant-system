pragma solidity ^0.4.24;
import "./CrowdFund.sol";

contract CrowdFundFactory {
    address[] crowdfunds;

    event ContractCreated(address newAddress);

    function createCrowdFund (
        uint raiseGoalAmount, 
        address payOutAddress, 
        address[] trusteesAddresses, 
        uint[] allMilestones,
        uint durationInSeconds,
        uint milestoneVotingPeriodInSeconds,
        bool immediateFirstMilestonePayout
        ) public returns(address) {
        address newCrowdFundContract = new CrowdFund(
            raiseGoalAmount,
            payOutAddress,
            trusteesAddresses,
            allMilestones,
            durationInSeconds,
            milestoneVotingPeriodInSeconds,
            immediateFirstMilestonePayout
        );
        emit ContractCreated(newCrowdFundContract);
        crowdfunds.push(newCrowdFundContract);
        return newCrowdFundContract;
    }
}