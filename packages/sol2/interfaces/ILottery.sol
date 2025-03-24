// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILottery {

struct ILotteryTicket {
    uint256 id;
    address owner;
}

event TicketPurchased(address indexed buyer, uint256 indexed ticketId);
event WinnerPaid(address indexed winner, uint256 amount);
event NewLotteryStarted(uint256 endTime);

function buyTicket() external payable;
function drawWinner() external;

function getTicketsByOwner(address owner) external view returns (uint256[] memory);
function getCurrentTicketCount() external view returns (uint256);
function getTimeLeft() external view returns (uint256);

function TICKET_PRICE() external view returns (uint256);
function MAX_TICKETS_PER_WALLET() external view returns (uint256);
function LOTTERY_DURATION() external view returns (uint256);
function prizePool() external view returns (uint256);
function lotteryEndTime() external view returns (uint256);
}
