const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery Contract (Hardhat Local)", function () {
  let Lottery, lottery;
  let owner, addr1, addr2, addr3, addr4, addr5;
  const ticketPrice = ethers.parseEther("0.001");

  before(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();
    Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy(owner.address, "0x0000000000000000000000000000000000000000000000000000000000000000", 0, 500000);
    await lottery.waitForDeployment();
  });

  it("should allow users to buy tickets", async function () {
    await expect(lottery.connect(addr1).buyTicket({ value: ticketPrice }))
      .to.emit(lottery, "TicketPurchased")
      .withArgs(addr1.address, 1);

    await expect(lottery.connect(addr2).buyTicket({ value: ticketPrice }))
      .to.emit(lottery, "TicketPurchased")
      .withArgs(addr2.address, 2);

    expect(await lottery.getCurrentTicketCount()).to.equal(2);
  });

  it("should not allow buying more than one ticket per user", async function () {
    await expect(
      lottery.connect(addr1).buyTicket({ value: ticketPrice })
    ).to.be.revertedWith("Solo se permite 1 boleto por ronda");
  });

  it("should pick a winner and reset the lottery", async function () {
    await lottery.connect(addr3).buyTicket({ value: ticketPrice });
    await lottery.connect(addr4).buyTicket({ value: ticketPrice });
    await lottery.connect(addr5).buyTicket({ value: ticketPrice });

    const tx = await lottery.fulfillRandomWords(1, [4]); // Simula que el boleto 4 es el ganador
    await tx.wait();

    expect(await lottery.getCurrentTicketCount()).to.equal(0);
  });
});
