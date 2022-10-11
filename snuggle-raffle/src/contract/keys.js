import * as anchor from '@project-serum/anchor';
import { PublicKey } from "@solana/web3.js";
import {
    PROGRAM_ID,
    GLOBAL_STATE_SEED,
    RAFFLE_SEED,
    BUYER_STATE_SEED,
    ZZZ_VAULT_SEED,
    ZZZ_TOKEN_MINT,
    REWARD_VAULT_SEED,
    AUCTION_SEED,
    NFT_VAULT_SEED,
    BIDDER_STATE_SEED,
    NATIVE_VAULT_SEED,
} from "./constants"

/** Get NFT Staking Account Keys  */

export const getGlobalState = async () => {
    const [poolKey] = await asyncGetPda(
        [Buffer.from(GLOBAL_STATE_SEED)],
        PROGRAM_ID
    );
    return poolKey;
};

export const getRaffleKey = async (raffle_id) => {
    let id = new anchor.BN(raffle_id);

    const [userStateKey] = await asyncGetPda(
        [Buffer.from(RAFFLE_SEED), id.toArrayLike(Buffer, "le", 4)],
        PROGRAM_ID
    );
    return userStateKey;
};

export const getAuctionKey = async (auction_id) => {
    let id = new anchor.BN(auction_id);

    const [userStateKey] = await asyncGetPda(
        [Buffer.from(AUCTION_SEED), id.toArrayLike(Buffer, "le", 4)],
        PROGRAM_ID
    );
    return userStateKey;
};

export const getBuyerStateKey = async (walletPk, raffle_id, ticketStartNum) => {
    let bigStartNum = new anchor.BN(ticketStartNum);
    let id = new anchor.BN(raffle_id);

    const [userStateKey] = await asyncGetPda(
        [Buffer.from(BUYER_STATE_SEED), walletPk.toBuffer(), id.toArrayLike(Buffer, "le", 4), bigStartNum.toArrayLike(Buffer, "le", 4)],
        PROGRAM_ID
    );
    return userStateKey;
};

export const getZzzVaultKey = async () => {
    const [payVaultKey] = await asyncGetPda(
        [
            Buffer.from(ZZZ_VAULT_SEED),
            ZZZ_TOKEN_MINT.toBuffer()
        ],
        PROGRAM_ID
    );
    console.log('pay vault key : ', payVaultKey.toBase58());
    return payVaultKey;
};

export const getRewardVaultKey = async (rewardMint) => {
    const [rewardVaultKey] = await asyncGetPda(
        [
            Buffer.from(REWARD_VAULT_SEED),
            rewardMint.toBuffer()
        ],
        PROGRAM_ID
    );
    console.log('reward vault key : ', rewardVaultKey.toBase58());
    return rewardVaultKey;
};

export const getNftVaultKey = async (nftMint) => {
    const [vaultKey] = await asyncGetPda(
        [
            Buffer.from(NFT_VAULT_SEED),
            nftMint.toBuffer()
        ],
        PROGRAM_ID
    );
    console.log('nft vault key : ', vaultKey.toBase58());
    return vaultKey;
};

export const getBidderStateKey = async (auctionId, bidderPk) => {
    let id = new anchor.BN(auctionId);

    const [pk] = await asyncGetPda(
        [Buffer.from(BIDDER_STATE_SEED), id.toArrayLike(Buffer, "le", 4), bidderPk.toBuffer()],
        PROGRAM_ID
    );

    return pk;
};

export const getNativeVaultKey = async () => {
    const [poolKey] = await asyncGetPda(
        [Buffer.from(NATIVE_VAULT_SEED)],
        PROGRAM_ID
    );
    return poolKey;
};


const asyncGetPda = async (
    seeds,
    programId
) => {
    const [pubKey, bump] = await PublicKey.findProgramAddress(seeds, programId);
    return [pubKey, bump];
};