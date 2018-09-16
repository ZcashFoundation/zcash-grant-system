pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract CrowdFund {
    using SafeMath for uint256;

    struct Milestone {
        uint amount;
        uint amountVotingAgainstPayout;
        uint payoutRequestVoteDeadline;
        bool paid;
    }

    struct Contributor {
        uint contributionAmount;
        // array index bool reflect milestone index vote
        bool[] milestoneNoVotes;
        bool refundVote;
        bool refunded;
    }

    event Deposited(address indexed payee, uint256 weiAmount);
    event Withdrawn(address indexed payee, uint256 weiAmount);

    bool public frozen;
    bool public isRaiseGoalReached;
    bool public immediateFirstMilestonePayout;
    uint public milestoneVotingPeriod;
    uint public deadline;
    uint public raiseGoal;
    uint public amountRaised;
    uint public minimumContributionAmount;
    uint public amountVotingForRefund;
    address public beneficiary;
    mapping(address => Contributor) public contributors;
    address[] public contributorList;
    // authorized addresses to ask for milestone payouts
    address[] public trustees;
    // constructor ensures that all values combined equal raiseGoal
    Milestone[] public milestones;

    constructor(
        uint _raiseGoal,
        address _beneficiary,
        address[] _trustees,
        uint[] _milestones,
        uint _deadline,
        uint _milestoneVotingPeriod,
        bool _immediateFirstMilestonePayout)
    public {
        require(_raiseGoal >= 1 ether, "Raise goal is smaller than 1 ether");
        require(_trustees.length >= 1 && _trustees.length <= 10, "Trustee addresses must be at least 1 and not more than 10");
        require(_milestones.length >= 1 && _milestones.length <= 10, "Milestones must be at least 1 and not more than 10");
        // TODO - require minimum duration
        // TODO - require minimum milestone voting period

        // ensure that cumalative milestone payouts equal raiseGoalAmount
        uint milestoneTotal = 0;
        for (uint i = 0; i < _milestones.length; i++) {
            uint milestoneAmount = _milestones[i];
            require(milestoneAmount > 0, "Milestone amount must be greater than 0");
            milestoneTotal = milestoneTotal.add(milestoneAmount);
            milestones.push(Milestone({
                amount: milestoneAmount,
                payoutRequestVoteDeadline: 0,
                amountVotingAgainstPayout: 0,
                paid: false
            }));
        }
        require(milestoneTotal == _raiseGoal, "Milestone total must equal raise goal");
        // TODO - increase minimum contribution amount is 0.1% of raise goal
        minimumContributionAmount = 1;
        raiseGoal = _raiseGoal;
        beneficiary = _beneficiary;
        trustees = _trustees;
        deadline = now + _deadline;
        milestoneVotingPeriod = _milestoneVotingPeriod;
        immediateFirstMilestonePayout = _immediateFirstMilestonePayout;
        isRaiseGoalReached = false;
        amountVotingForRefund = 0;
        frozen = false;
        // assumes no ether contributed as part of contract deployment
        amountRaised = 0;
    }

    function contribute() public payable onlyOnGoing onlyUnfrozen {
        // don't allow overfunding
        uint newAmountRaised = amountRaised.add(msg.value);
        require(newAmountRaised <= raiseGoal, "Contribution exceeds the raise goal.");
        // require minimumContributionAmount (set during construction)
        // there may be a special case where just enough has been raised so that the remaining raise amount is just smaller than the minimumContributionAmount
        // in this case, allow that the msg.value + amountRaised will equal the raiseGoal.
        // This makes sure that we don't enter a scenario where a proposal can never be fully funded
        bool greaterThanMinimum = msg.value >= minimumContributionAmount;
        bool exactlyRaiseGoal = newAmountRaised == raiseGoal;
        require(greaterThanMinimum || exactlyRaiseGoal, "msg.value greater than minimum, or msg.value == remaining amount to be raised");
        // in cases where an address pays > 1 times
        if (contributors[msg.sender].contributionAmount == 0) {
            contributors[msg.sender] = Contributor({
                contributionAmount: msg.value,
                milestoneNoVotes: new bool[](milestones.length),
                refundVote: false,
                refunded: false
            });
            contributorList.push(msg.sender);
        }
        else {
            contributors[msg.sender].contributionAmount = contributors[msg.sender].contributionAmount.add(msg.value);
        }

        amountRaised = newAmountRaised;
        if (amountRaised == raiseGoal) {
            isRaiseGoalReached = true;
        }
        emit Deposited(msg.sender, msg.value);
    }

    function requestMilestonePayout (uint index) public onlyTrustee onlyRaised onlyUnfrozen {
        bool milestoneAlreadyPaid = milestones[index].paid;
        bool voteDeadlineHasPassed = milestones[index].payoutRequestVoteDeadline > now;
        bool majorityAgainstPayout = isMajorityVoting(milestones[index].amountVotingAgainstPayout);
        // prevent requesting paid milestones
        require(!milestoneAlreadyPaid, "Milestone already paid");

        int lowestIndexPaid = -1;
        for (uint i = 0; i < milestones.length; i++) {
            if (milestones[i].paid) {
                lowestIndexPaid = int(i);
            }
        }

        require(index == uint(lowestIndexPaid + 1), "Milestone request must be for first unpaid milestone");
        // begin grace period for contributors to vote no on milestone payout
        if (milestones[index].payoutRequestVoteDeadline == 0) {
            if (index == 0 && immediateFirstMilestonePayout) {
                // make milestone payouts immediately avtheailable for the first milestone if immediateFirstMilestonePayout is set during consutrction
                milestones[index].payoutRequestVoteDeadline = 1;
            } else {
                milestones[index].payoutRequestVoteDeadline = now.add(milestoneVotingPeriod);
            }
        }
        // if the payoutRequestVoteDealine has passed and majority voted against it previously, begin the grace period with 2 times the deadline
        else if (voteDeadlineHasPassed && majorityAgainstPayout) {
            milestones[index].payoutRequestVoteDeadline = now.add(milestoneVotingPeriod.mul(2));
        }
    }

    function voteMilestonePayout(uint index, bool vote) public onlyContributor onlyRaised onlyUnfrozen {
        bool existingMilestoneNoVote = contributors[msg.sender].milestoneNoVotes[index];
        require(existingMilestoneNoVote != vote, "Vote value must be different than existing vote state");
        bool milestoneVotingStarted = milestones[index].payoutRequestVoteDeadline > 0;
        bool votePeriodHasEnded = milestones[index].payoutRequestVoteDeadline <= now;
        bool onGoingVote = milestoneVotingStarted && !votePeriodHasEnded;
        require(onGoingVote, "Milestone voting must be open");
        contributors[msg.sender].milestoneNoVotes[index] = vote;
        if (!vote) {
            milestones[index].amountVotingAgainstPayout = milestones[index].amountVotingAgainstPayout.sub(contributors[msg.sender].contributionAmount);
        } else if (vote) {
            milestones[index].amountVotingAgainstPayout = milestones[index].amountVotingAgainstPayout.add(contributors[msg.sender].contributionAmount);
        }
    }

    function payMilestonePayout(uint index) public onlyRaised onlyUnfrozen {
        bool voteDeadlineHasPassed = milestones[index].payoutRequestVoteDeadline < now;
        bool majorityVotedNo = isMajorityVoting(milestones[index].amountVotingAgainstPayout);
        bool milestoneAlreadyPaid = milestones[index].paid;
        if (voteDeadlineHasPassed && !majorityVotedNo && !milestoneAlreadyPaid) {
            milestones[index].paid = true;
            uint amount = milestones[index].amount;
            beneficiary.transfer(amount);
            emit Withdrawn(beneficiary, amount);
            // if the final milestone just got paid
            if (milestones.length.sub(index) == 1) {
                // useful to selfdestruct in case funds were forcefully deposited into contract. otherwise they are lost.
                selfdestruct(beneficiary);
            }
        } else {
            revert("required conditions were not satisfied");
        }
    }

    function voteRefund(bool vote) public onlyContributor onlyRaised onlyUnfrozen {
        bool refundVote = contributors[msg.sender].refundVote;
        require(vote != refundVote, "Existing vote state is identical to vote value");
        contributors[msg.sender].refundVote = vote;
        if (!vote) {
            amountVotingForRefund = amountVotingForRefund.sub(contributors[msg.sender].contributionAmount);
        }
        else if (vote) {
            amountVotingForRefund = amountVotingForRefund.add(contributors[msg.sender].contributionAmount);
        }
    }

    function refund() public onlyUnfrozen {
        bool callerIsTrustee = isCallerTrustee();
        bool crowdFundFailed = isFailed();
        bool majorityVotingToRefund = isMajorityVoting(amountVotingForRefund);
        require(callerIsTrustee || crowdFundFailed || majorityVotingToRefund, "Required conditions for refund are not met");
        frozen = true;
    }

    // anyone can refund a contributor if a crowdfund has been frozen
    function withdraw(address refundAddress) public onlyFrozen {
        require(frozen, "CrowdFund is not frozen");
        bool isRefunded = contributors[refundAddress].refunded;
        require(!isRefunded, "Specified address is already refunded");
        contributors[refundAddress].refunded = true;
        uint contributionAmount = contributors[refundAddress].contributionAmount;
        // TODO - maybe don't use address(this).balance
        uint amountToRefund = contributionAmount.mul(address(this).balance).div(raiseGoal);
        refundAddress.transfer(amountToRefund);
        emit Withdrawn(refundAddress, amountToRefund);
    }

    // it may be useful to selfdestruct in case funds were force deposited to the contract
    function destroy() public onlyTrustee onlyFrozen {
        for (uint i = 0; i < contributorList.length; i++) {
            address contributorAddress = contributorList[i];
            if (!contributors[contributorAddress].refunded) {
                revert("At least one contributor has not yet refunded");
            }
        }
        selfdestruct(beneficiary);
    }

    function isMajorityVoting(uint valueVoting) public view returns (bool) {
        return valueVoting.mul(2) > amountRaised;
    }

    function isCallerTrustee() public view returns (bool) {
        for (uint i = 0; i < trustees.length; i++) {
            if (msg.sender == trustees[i]) {
                return true;
            }
        }
        return false;
    }

    function isFailed() public view returns (bool) {
        return now >= deadline && !isRaiseGoalReached;
    }

    function getContributorMilestoneVote(address contributorAddress, uint milestoneIndex) public view returns (bool) { 
        return contributors[contributorAddress].milestoneNoVotes[milestoneIndex];
    }

    function getContributorContributionAmount(address contributorAddress) public view returns (uint) {
        return contributors[contributorAddress].contributionAmount;
    }

    modifier onlyFrozen() {
        require(frozen, "CrowdFund is not frozen");
        _;
    }

    modifier onlyUnfrozen() {
        require(!frozen, "CrowdFund is frozen");
        _;
    }

    modifier onlyRaised() {
        require(isRaiseGoalReached, "Raise goal is not reached");
        _;
    }

    modifier onlyOnGoing() {
        require(now <= deadline && !isRaiseGoalReached, "CrowdFund is not ongoing");
        _;
    }

    modifier onlyContributor() {
        require(contributors[msg.sender].contributionAmount != 0, "Caller is not a contributor");
        _;
    }

    modifier onlyTrustee() {
        require(isCallerTrustee(), "Caller is not a trustee");
        _;
    }

}