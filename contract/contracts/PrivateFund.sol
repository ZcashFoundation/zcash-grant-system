pragma solidity ^0.4.24;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract PrivateFund {

    using SafeMath for uint256;

    struct Milestone {
        uint amount;
        bool openRequest;
        bool paid;
    }

    struct BoardMember {
        bool[] milestoneApprovals;
        address refundAddress;
        // TODO - refactor not to waste space like this;
        bool exists;
    }

    event Transfered(address payee, uint weiAmount);
    event Deposited(address indexed payee, uint256 weiAmount);
    event Withdrawn(address indexed payee, uint256 weiAmount);

    uint public amountRaised;
    uint public raiseGoal;
    uint public quorum;
    address public beneficiary;
    address public funder;
    address[] public trustees;
    bool unanimityForRefunds;
    
    mapping(address => BoardMember) public boardMembers;
    address[] public boardMembersList;
    // constructor ensures that all values combined equal raiseGoal
    Milestone[] public milestones;

    constructor(
        uint _raiseGoal, 
        address _beneficiary, 
        address[] _trustees, 
        uint _quorum,
        address[] _boardMembers,
        uint[] _milestones,
        address _funder,
        bool _unanimityForRefunds)
    public {
        require(_raiseGoal >= 1 ether, "Raise goal is smaller than 1 ether");
        require(_milestones.length >= 1, "Milestones must be at least 1");
        require(_quorum <= _boardMembers.length, "quorum is larger than total number of boardMembers");
        require(_quorum >= 1, "quorum must be at least 1");
        // TODO - require minimum milestone voting period

        // ensure that cumalative milestone payouts equal raiseGoalAmount
        uint milestoneTotal = 0;
        for (uint i = 0; i < _milestones.length; i++) {
            uint milestoneAmount = _milestones[i];
            require(milestoneAmount > 0, "Milestone amount must be greater than 0");
            milestoneTotal = milestoneTotal.add(milestoneAmount);
            milestones.push(Milestone({
                amount: milestoneAmount,
                openRequest: false,
                paid: false
            }));
        }
        require(milestoneTotal == _raiseGoal, "Milestone total must equal raise goal");

        boardMembersList = _boardMembers;
        for (uint e = 0; e < boardMembersList.length; e++) {
            address boardMemberAddress = boardMembersList[e];
            boardMembers[boardMemberAddress] = BoardMember({
                milestoneApprovals: new bool[](milestones.length),
                refundAddress: 0,
                exists: true
            });
        }
        
        quorum = _quorum;
        raiseGoal = _raiseGoal;
        beneficiary = _beneficiary;
        trustees = _trustees;
        funder = _funder;
        unanimityForRefunds = _unanimityForRefunds;
        amountRaised = 0;
    }

    function contribute() public payable  {
        require(msg.sender == funder, "Sender must be funder");
        require(amountRaised.add(msg.value) == raiseGoal, "Contribution must be exactly raise goal");
        amountRaised = msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function requestMilestonePayout (uint index) public onlyTrustee onlyRaised {
        bool milestoneAlreadyPaid = milestones[index].paid;
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
        require(!milestones[index].openRequest, "Milestone must not have already been requested");
        milestones[index].openRequest = true;
    }

    function voteMilestonePayout(uint index, bool vote) public onlyBoardMember onlyRaised {
        bool existingMilestoneVote = boardMembers[msg.sender].milestoneApprovals[index];
        require(existingMilestoneVote != vote, "Vote value must be different than existing vote state");
        require(milestones[index].openRequest, "Milestone voting must be open");
        boardMembers[msg.sender].milestoneApprovals[index] = vote;
    }

    function payMilestonePayout(uint index) public onlyRaised {
        bool quorumReached = isQuorumReachedForMilestonePayout(index);
        bool milestoneAlreadyPaid = milestones[index].paid;
        if (quorumReached && !milestoneAlreadyPaid) {
            milestones[index].paid = true;
            milestones[index].openRequest = false;
            fundTransfer(beneficiary, milestones[index].amount);
            // TODO trigger self-destruct with any un-spent funds (since funds could have been force sent at any point)
        } else {
            revert("required conditions were not satisfied");
        }
    }
    
    function voteRefundAddress(address refundAddress) public onlyBoardMember onlyRaised {
        boardMembers[msg.sender].refundAddress = refundAddress;
    }

    function refund(address refundAddress) public onlyBoardMember onlyRaised {
        require(isConsensusReachedForRefund(refundAddress), "Unanimity is not reached to refund to given address");
        selfdestruct(refundAddress);
    }

    function fundTransfer(address etherReceiver, uint256 amount) private {
        etherReceiver.transfer(amount);
        emit Transfered(etherReceiver, amount);
    }

    function isConsensusReachedForRefund(address refundAddress) public view onlyRaised returns (bool) {
        uint yesVotes = 0;
        for (uint i = 0; i < boardMembersList.length; i++) {
            address boardMemberAddress = boardMembersList[i];
            address boardMemberRefundAddressSelection = boardMembers[boardMemberAddress].refundAddress;
            if (boardMemberRefundAddressSelection == refundAddress) {
                yesVotes += 1;                
            }
        }
        if (unanimityForRefunds) {
            return yesVotes == boardMembersList.length;
        } else {
            return yesVotes >= quorum;
        }
    }
 
    function isQuorumReachedForMilestonePayout(uint milestoneIndex) public view onlyRaised returns (bool) {
        uint yesVotes = 0;
        for (uint i = 0; i < boardMembersList.length; i++) {
            address boardMemberAddress = boardMembersList[i];
            bool boardMemberVote = boardMembers[boardMemberAddress].milestoneApprovals[milestoneIndex];
            if (boardMemberVote) {
                yesVotes += 1;                
            }
        }
        return yesVotes >= quorum;
    }

    function isCallerTrustee() public view returns (bool) {
        for (uint i = 0; i < trustees.length; i++) {
            if (msg.sender == trustees[i]) {
                return true;
            }
        }
        return false;
    }

    function getBoardMemberMilestoneVote(address boardMemberAddress, uint milestoneIndex) public view returns (bool) {
        return boardMembers[boardMemberAddress].milestoneApprovals[milestoneIndex];
    }

    modifier onlyRaised() {
        require(raiseGoal == amountRaised, "Proposal is not funded");
        _;
    }

    modifier onlyBoardMember() {
        require(boardMembers[msg.sender].exists, "Caller is not a board member");
        _;
    }

    modifier onlyTrustee() {
        require(isCallerTrustee(), "Caller is not a trustee");
        _;
    }

}