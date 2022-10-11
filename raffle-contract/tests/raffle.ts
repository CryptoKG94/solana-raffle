import * as anchor from "@project-serum/anchor";
import { AnchorError, Program } from "@project-serum/anchor";
import { Raffle } from "../target/types/raffle";
import { SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";

const PublicKey = anchor.web3.PublicKey;
const GLOBAL_STATE_SEED = "GLOBAL-STATE-SEED";
const RAFFLE_SEED = "ONE-RAFFLE-SEED";
const BUYER_STATE_SEED = "BUYER-STATE-SEED";
const AUCTION_SEED = "ONE-AUCTION-SEED";
const VAULT_SEED = "RA-VAULT-SEED";
const ZZZ_VAULT_SEED = "RA-PAY-VAULT-SEED";
const REWARD_VAULT_SEED = "RA-REWARD-VAULT-SEED";
const NFT_VAULT_SEED = "RA-AUCTION-NFT-VAULT-SEED";
const BIDDER_STATE_SEED = "RA-BIDDER-STATE-SEED";
const NATIVE_VAULT_SEED = "RA-NATIVE-VAULT-SEED";


export const getNativeVaultKey = async (pid) => {
  const [poolKey] = await asyncGetPda(
    [Buffer.from(NATIVE_VAULT_SEED)],
    pid
  );
  return poolKey;
};


export const getGlobalState = async (pid) => {
  const [poolKey] = await asyncGetPda(
    [Buffer.from(GLOBAL_STATE_SEED)],
    pid
  );
  return poolKey;
};

export const getRaffleKey = async (pid, raffle_id) => {
  let id = new anchor.BN(raffle_id);

  const [userStateKey] = await asyncGetPda(
    [Buffer.from(RAFFLE_SEED), id.toArrayLike(Buffer, "le", 4)],
    pid
  );
  return userStateKey;
};

export const getAuctionKey = async (pid, auction_id) => {
  let id = new anchor.BN(auction_id);

  const [userStateKey] = await asyncGetPda(
    [Buffer.from(AUCTION_SEED), id.toArrayLike(Buffer, "le", 4)],
    pid
  );
  return userStateKey;
};

export const getBuyerStateKey = async (pid, walletPk, raffleId, ticketStartNum) => {
  let bigStartNum = new anchor.BN(ticketStartNum);
  let id = new anchor.BN(raffleId);

  const [userStateKey] = await asyncGetPda(
    [Buffer.from(BUYER_STATE_SEED), walletPk.toBuffer(), id.toArrayLike(Buffer, "le", 4), bigStartNum.toArrayLike(Buffer, "le", 4)],
    pid
  );
  return userStateKey;
};

export const getPayVaultKey = async (pid, zzzMint) => {
  const [payVaultKey] = await asyncGetPda(
    [
      Buffer.from(ZZZ_VAULT_SEED),
      zzzMint.toBuffer()
    ],
    pid
  );
  console.log('pay vault key : ', payVaultKey.toBase58());
  return payVaultKey;
};

export const getNftVaultKey = async (pid, nftMint) => {
  const [vaultKey] = await asyncGetPda(
    [
      Buffer.from(NFT_VAULT_SEED),
      nftMint.toBuffer()
    ],
    pid
  );
  console.log('nft vault key : ', vaultKey.toBase58());
  return vaultKey;
};

export const getRewardVaultKey = async (pid, rewardMint) => {
  const [rewardVaultKey] = await asyncGetPda(
    [
      Buffer.from(REWARD_VAULT_SEED),
      rewardMint.toBuffer()
    ],
    pid
  );
  console.log('reward vault key : ', rewardVaultKey.toBase58());
  return rewardVaultKey;
};

export const getBidderStateKey = async (pid, auctionId, bidderPk) => {
  let id = new anchor.BN(auctionId);

  const [pk] = await asyncGetPda(
    [Buffer.from(BIDDER_STATE_SEED), id.toArrayLike(Buffer, "le", 4), bidderPk.toBuffer()],
    pid
  );

  return pk;
};


const asyncGetPda = async (
  seeds,
  programId
) => {
  const [pubKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
  return [pubKey, bump];
};

export const CHAINLINK_PROGRAM_ID = "HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny";
// SOL/USD feed account
export const CHAINLINK_FEED = "HgTtcbcmp5BeThax5AU8vg4VwK79qAvAKKFMs8txMLW6";


describe("raffle", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Raffle as Program<Raffle>;
  const superOwner = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();

  it("Is initialized!", async () => {
    // Add your test here.
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 9000000000),
      "confirmed"
    );


    // token mint
    let zzz_mint = await Token.createMint(
      provider.connection,
      user,
      user.publicKey,
      null,
      6,
      TOKEN_PROGRAM_ID
    );
    let pay_account = await zzz_mint.createAssociatedTokenAccount(user.publicKey);

    await zzz_mint.mintTo(
      pay_account,
      user,
      [],
      1000_000_000
    )
    console.log("create pay token!");


    let globalState = await getGlobalState(program.programId);
    let payVaultKey = await getPayVaultKey(program.programId, zzz_mint.publicKey);
    let nativeVaultKey = await getNativeVaultKey(program.programId);

    const res = await program.methods.initialize().accounts({
      admin: user.publicKey,
      globalState: globalState,
      nativeVault: nativeVaultKey,
      zzzMint: zzz_mint.publicKey,
      zzzVault: payVaultKey,
    }).signers([user])
      .rpc();

      return;

    // create raffle
    let raffleId = 1;
    let ticketCount = 10;
    let bnTicketPrice = new anchor.BN(1_000_000);

    let startTime = new Date("2022-08-01").getTime();
    let endTime = new Date("2022-08-10").getTime();
    let raffleKey = await getRaffleKey(program.programId, raffleId);

    let ix = await program.methods.createRaffle(raffleId, ticketCount, bnTicketPrice, new anchor.BN(startTime), new anchor.BN(endTime), "name", "description", "", "", 0, "").accounts({
      admin: user.publicKey,
      globalState: globalState,
      raffle: raffleKey,
      rewardMint: zzz_mint.publicKey,
      rewardVault: await getRewardVaultKey(program.programId, zzz_mint.publicKey),
      sourceAccount: pay_account,
    }).signers([user]).rpc();

    /// buy ticket
    let data = await program.account.raffle.fetch(raffleKey);
    let ticketStartNum = data.soldTickets + 1;

    ix = await program.methods.buyTicket(raffleId, 3).accounts({
      user: user.publicKey,
      globalState: globalState,
      raffle: raffleKey,
      buyerState: await getBuyerStateKey(program.programId, user.publicKey, raffleId, ticketStartNum),
      zzzMint: zzz_mint.publicKey,
      zzzVault: payVaultKey,
      sourceAccount: pay_account,
    }).signers([user]).rpc();

    // finish raffle
    await program.methods.finishRaffle(raffleId).accounts({
      admin: user.publicKey,
      globalState: globalState,
      raffle: raffleKey,
      pythAccount: new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"),
    }).signers([user]).rpc();

    let data1 = await program.account.raffle.fetch(raffleKey);
    let data2 = await program.account.buyerState.fetch(await getBuyerStateKey(program.programId, user.publicKey, raffleId, ticketStartNum));
    // console.log('11111111111', data1, data2);

    // claim_rewards
    // run in case only winner
    // await program.methods.claimRewards(raffleId).accounts({
    //   user: user.publicKey,
    //   raffle: raffleKey,
    //   buyerState: await getBuyerStateKey(program.programId, user.publicKey, raffleId, ticketStartNum),
    //   globalState: globalState,
    //   rewardMint : zzz_mint.publicKey,
    //   rewardVault : await getRewardVaultKey(program.programId, zzz_mint.publicKey),
    //   rewardToAccount : pay_account,
    // }).signers([user]).rpc();

    // genWlWinners
    // let res1 = await program.methods.genWlWinners(100).accounts({
    //   pythAccount: new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"),
    // }).view();

    // console.log('222222222', res1);

    // auction
    let auctionId = 1;
    let auctionKey = await getAuctionKey(program.programId, auctionId);

    await program.methods.createAuction(auctionId, superOwner.publicKey, 1, new anchor.BN(startTime), new anchor.BN(endTime), new anchor.BN(1_000_000)).accounts({
      admin: user.publicKey,
      globalState: globalState,
      auction: auctionKey,
      nftMint: zzz_mint.publicKey,
      nftVault: await getNftVaultKey(program.programId, zzz_mint.publicKey),
      sourceAccount: pay_account,
    }).signers([user]).rpc();

    data = await program.account.auction.fetch(auctionKey);

    await program.methods.bid(auctionId, new anchor.BN(2_000_000)).accounts({
      user: user.publicKey,
      globalState: globalState,
      auction: auctionKey,
      bidderState: await getBidderStateKey(program.programId, auctionId, user.publicKey),
      zzzMint: zzz_mint.publicKey,
      zzzVault: payVaultKey,
      sourceAccount: pay_account,
    }).signers([user]).rpc();

    // await program.methods.cancelBid(auctionId).accounts({
    //   user: user.publicKey,
    //   globalState: globalState,
    //   auction: auctionKey,
    //   bidderState: await getBidderStateKey(program.programId, auctionId, user.publicKey),
    //   zzzMint: zzz_mint.publicKey,
    //   zzzVault: payVaultKey,
    //   refundReceiver: pay_account,
    //   nativeVault: nativeVaultKey,
    // }).signers([user]).rpc();

    await program.methods.finishAuction(auctionId).accounts({
      admin: user.publicKey,
      globalState: globalState,
      auction: auctionKey,
      nftVault: await getNftVaultKey(program.programId, zzz_mint.publicKey),
      nftMint: zzz_mint.publicKey,
      nftReceiver: pay_account,
    }).signers([user]).rpc();


    await program.methods.bidRefund(auctionId).accounts({
      admin: user.publicKey,
      globalState: globalState,
      auction: auctionKey,
      bidder: user.publicKey,
      bidderState: await getBidderStateKey(program.programId, auctionId, user.publicKey),
      zzzMint: zzz_mint.publicKey,
      zzzVault: payVaultKey,
      destAccount: pay_account,
    }).signers([user]).rpc();

  });
});
