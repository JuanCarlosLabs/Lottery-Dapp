// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { VRFConsumerBaseV2Plus } from "../chainlinkVRF/VRFConsumerBaseV2Plus.sol";
import { IVRFCoordinatorV2Plus } from "../chainlinkVRF/interfaces/IVRFCoordinatorV2Plus.sol";
import { VRFV2PlusClient } from "../chainlinkVRF/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract Lottery is ReentrancyGuard, VRFConsumerBaseV2Plus {
    struct LotteryTicket {
        uint256 id;
        address owner;
    }

    uint256 public constant TICKET_PRICE = 0.001 ether;
    uint256 public constant MAX_TICKETS = 5;
    uint256 public constant MAX_TICKETS_PER_WALLET = 1;

    uint256 private _currentTicketId;
    mapping(uint256 => LotteryTicket) private _tickets;
    mapping(address => uint256) private _ticketsByOwner;
    uint256 public prizePool;

    event TicketPurchased(address indexed buyer, uint256 indexed ticketId);
    event WinnerPaid(address indexed winner, uint256 amount);
    event NewLotteryStarted();
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event DebugLog(string message, uint256 value);

    IVRFCoordinatorV2Plus public immutable vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint256 public immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    mapping(uint256 => uint256[]) public randomResults;

    constructor(
        address vrfCoordinatorV2,
        bytes32 gasLane,
        uint256 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2Plus(vrfCoordinatorV2) {
        vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        emit NewLotteryStarted();
    }

    function buyTicket() external payable nonReentrant {
        console.log("Iniciando compra de boleto por:", msg.sender);
        require(_ticketsByOwner[msg.sender] == 0, "Solo se permite 1 boleto por ronda");
        require(msg.value == TICKET_PRICE, "Precio del boleto incorrecto");

        _currentTicketId++;
        _tickets[_currentTicketId] = LotteryTicket({
            id: _currentTicketId,
            owner: msg.sender
        });

        _ticketsByOwner[msg.sender] = _currentTicketId;
        prizePool += msg.value;

        emit TicketPurchased(msg.sender, _currentTicketId);
        emit DebugLog("Boleto comprado, conteo actual", _currentTicketId);

        if (_currentTicketId == MAX_TICKETS) {
            emit DebugLog("Se alcanzo el maximo de boletos, solicitando aleatoriedad", 0);
            requestRandomWords();
        }
    }

    function requestRandomWords() internal {
        require(i_subscriptionId > 0, "ID de suscripcion no establecido");
        require(address(vrfCoordinator) != address(0), "Coordinador VRF no valido");
        require(i_callbackGasLimit > 0, "Limite de gas de callback no establecido");

        emit DebugLog("Solicitando palabras aleatorias de Chainlink VRF", 0);

        uint256 requestId = vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_gasLane,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        emit RequestSent(requestId, NUM_WORDS);
        emit DebugLog("Solicitud de aleatoriedad enviada, requestId", requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        emit RequestFulfilled(requestId, randomWords);
        emit DebugLog("Aleatoriedad cumplida, primera palabra aleatoria", randomWords[0]);

        require(_currentTicketId > 0, "No se vendieron boletos");

        uint256 winningTicket = (randomWords[0] % _currentTicketId) + 1;
        address winner = _tickets[winningTicket].owner;

        emit WinnerPaid(winner, prizePool);
        emit DebugLog("Ganador seleccionado, ID del boleto", winningTicket);

        uint256 prize = prizePool;
        prizePool = 0;
        _currentTicketId = 0;

        for (uint256 i = 1; i <= MAX_TICKETS; i++) {
            delete _ticketsByOwner[_tickets[i].owner];
            delete _tickets[i];
        }

        console.log("Enviando premio:", prize, "ETH a:", winner);
        (bool success, ) = payable(winner).call{value: prize}("");
        require(success, "Pago fallido");
        console.log("Pago exitoso!");

        emit NewLotteryStarted();
        emit DebugLog("Loteria reiniciada para nueva ronda", 0);
    }

    function rawFulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) external override {
        require(msg.sender == address(vrfCoordinator), "Solo el coordinador VRF puede cumplir");
        fulfillRandomWords(requestId, randomWords);
    }

    function getTicketsByOwner(address owner) external view returns (uint256) {
        return _ticketsByOwner[owner];
    }

    function getCurrentTicketCount() external view returns (uint256) {
        return _currentTicketId;
    }
}