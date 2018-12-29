const Voting = artifacts.require("Voting");
const MerkleTree = artifacts.require("MerkleTree");
const MerkleTreeClient = require("../client/merkle");
const { toHex, toWei, soliditySha3, padRight } = web3.utils;
const { getCurrentTimestamp, forwardTime, checkErrorRevert } = require("../helpers/utils");

contract("Voting", () => {
  it("should be able to start a vote", async () => {
    const voting = await Voting.new();
    const currentTimestamp = await getCurrentTimestamp();

    const votePeriod = 60 * 60 * 24;
    const revealPeriod = 60 * 60;
    const deadline = currentTimestamp + votePeriod;
    const numOptions = 3;

    await voting.startVote(deadline, revealPeriod, numOptions);

    const _numOptions = await voting.getNumberOfOptions();
    const _voteDeadline = await voting.getVoteDeadline();
    const _revealPeriod = await voting.getRevealPeriodLength();

    assert.equal(numOptions, _numOptions.toNumber());
    assert.equal(deadline, _voteDeadline.toNumber());
    assert.equal(revealPeriod, _revealPeriod.toNumber());
  });

  it("should not be able to start a vote twice", async () => {
    const voting = await Voting.new();
    const currentTimestamp = await getCurrentTimestamp();

    const votePeriod = 60 * 60 * 24;
    const revealPeriod = 60 * 60;
    const deadline = currentTimestamp + votePeriod;
    const numOptions = 3;

    await voting.startVote(deadline, revealPeriod, numOptions);
    await checkErrorRevert(voting.startVote(deadline, revealPeriod, numOptions), "vote-already-started");
  });

  it("should be able to submit a secret", async () => {
    const voting = await Voting.new();

    const currentTimestamp = await getCurrentTimestamp();
    const votePeriod = 60 * 60 * 24;
    const revealPeriod = 60 * 60;
    const deadline = currentTimestamp + votePeriod;
    const numOptions = 3;

    await voting.startVote(deadline, revealPeriod, numOptions);

    const secretValueHash = soliditySha3(padRight(toHex("secret"), 64));
    const secretSaltHash = soliditySha3(4);
    await voting.submitSecret(secretValueHash, secretSaltHash, {
      value: toWei("1", "ether")
    });

    const firstLevelHash = soliditySha3(secretValueHash, secretSaltHash);
    const lockedAmount = await voting.getLockedAmountFor(firstLevelHash);
    assert.equal(lockedAmount.toString(), toWei("1", "ether"));
  });

  it("should not be able to submit a same secret twice", async () => {
    const voting = await Voting.new();

    const currentTimestamp = await getCurrentTimestamp();
    const votePeriod = 60 * 60 * 24;
    const revealPeriod = 60 * 60;
    const deadline = currentTimestamp + votePeriod;
    const numOptions = 3;

    await voting.startVote(deadline, revealPeriod, numOptions);

    const secretValueHash = soliditySha3(padRight(toHex("secret"), 64));
    const secretSaltHash = soliditySha3(4);
    await voting.submitSecret(secretValueHash, secretSaltHash, {
      value: toWei("1", "ether")
    });

    await checkErrorRevert(voting.submitSecret(secretValueHash, secretSaltHash, {
      value: toWei("1", "ether")
    }), "stake-already-deposited");
  });

  it("should not be able to submit secret before the vote has started", async () => {
    const voting = await Voting.new();

    const secretValueHash = soliditySha3(padRight(toHex("secret"), 64));
    const secretSaltHash = soliditySha3(4);

    await checkErrorRevert(voting.submitSecret(secretValueHash, secretSaltHash, {
      value: toWei("1", "ether")
    }), "vote-not-running");
  });

  it("should not be able to submit a secret after the voting has finished", async () => {
    const voting = await Voting.new();

    const currentTimestamp = await getCurrentTimestamp();
    const votePeriod = 60 * 60 * 24;
    const revealPeriod = 60 * 60;
    const deadline = currentTimestamp + votePeriod;
    const numOptions = 3;

    await voting.startVote(deadline, revealPeriod, numOptions);

    await forwardTime(votePeriod + 1);

    const secretValueHash = soliditySha3(padRight(toHex("secret"), 64));
    const secretSaltHash = soliditySha3(4);
    await checkErrorRevert(voting.submitSecret(secretValueHash, secretSaltHash, {
      value: toWei("1", "ether")
    }), "vote-not-running");
  });

  it("should be able to reveal secret", async () => {
    const voting = await Voting.new();
    const merkleTree = await MerkleTree.at(voting.address);
    const merkleTreeClient = new MerkleTreeClient(merkleTree);

    const currentTimestamp = await getCurrentTimestamp();
    const votePeriod = 60 * 60 * 24;
    const revealPeriod = 60 * 60;
    const deadline = currentTimestamp + votePeriod;
    const numOptions = 3;

    await voting.startVote(deadline, revealPeriod, numOptions);

    const secretValueHash = soliditySha3(padRight(toHex("secret"), 64));
    const secretSaltHash = soliditySha3(4);
    await voting.submitSecret(secretValueHash, secretSaltHash, {
      value: toWei("1", "ether")
    });

    await merkleTreeClient.insert("secret", 4);
    await merkleTreeClient.sync();

    await forwardTime(votePeriod + 1);

    const rootHash = await merkleTree.getRootHash();
    const siblings = merkleTreeClient.getProof(rootHash, "secret");

    const option = 1;
    await voting.revealSecret(option, secretValueHash, siblings);

    const numberOfVotes = await voting.getNumberOfVotesFor(option);
    assert.equal(numberOfVotes.toNumber(), 1);
  });

  it("should not be able to reveal vote after the reveal period", async () => {
    const voting = await Voting.new();
    const merkleTree = await MerkleTree.at(voting.address);
    const merkleTreeClient = new MerkleTreeClient(merkleTree);

    const currentTimestamp = await getCurrentTimestamp();
    const votePeriod = 60 * 60 * 24;
    const revealPeriod = 60 * 60;
    const deadline = currentTimestamp + votePeriod;
    const numOptions = 3;

    await voting.startVote(deadline, revealPeriod, numOptions);

    const secretValueHash = soliditySha3(padRight(toHex("secret"), 64));
    const secretSaltHash = soliditySha3(4);
    await voting.submitSecret(secretValueHash, secretSaltHash, {
      value: toWei("1", "ether")
    });

    await merkleTreeClient.insert("secret", 4);
    await merkleTreeClient.sync();

    await forwardTime(votePeriod + revealPeriod);

    const rootHash = await merkleTree.getRootHash();
    const siblings = merkleTreeClient.getProof(rootHash, "secret");

    const option = 1;
    await checkErrorRevert(voting.revealSecret(option, toHex("secret"), siblings), "not-in-reveal-period");

    const numberOfVotes = await voting.getNumberOfVotesFor(option);
    assert.equal(numberOfVotes.toNumber(), 0);
  });

  it("should not be able to pass invalid proof", async () => {
    const voting = await Voting.new();
    const merkleTree = await MerkleTree.at(voting.address);
    const merkleTreeClient = new MerkleTreeClient(merkleTree);

    const currentTimestamp = await getCurrentTimestamp();
    const votePeriod = 60 * 60 * 24;
    const revealPeriod = 60 * 60;
    const deadline = currentTimestamp + votePeriod;
    const numOptions = 3;

    await voting.startVote(deadline, revealPeriod, numOptions);

    const secretValueHash = soliditySha3(padRight(toHex("secret"), 64));
    const secretSaltHash = soliditySha3(4);
    await voting.submitSecret(secretValueHash, secretSaltHash, {
      value: toWei("1", "ether")
    });

    await merkleTreeClient.insert("secret", 4);
    await merkleTreeClient.sync();

    await forwardTime(votePeriod + 1);

    const rootHash = await merkleTree.getRootHash();
    const siblings = merkleTreeClient.getProof(rootHash, "secret");

    const option = 1;
    await checkErrorRevert(voting.revealSecret(option, toHex("secret1"), siblings), "invalid-proof");

    const numberOfVotes = await voting.getNumberOfVotesFor(option);
    assert.equal(numberOfVotes.toNumber(), 0);
  });
});
