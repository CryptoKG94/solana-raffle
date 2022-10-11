import * as anchor from '@project-serum/anchor';
import { PublicKey, Keypair } from '@solana/web3.js';
import {
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount, getMint, createCloseAccountInstruction, createAssociatedTokenAccountInstruction, createAccount } from "@solana/spl-token";
import { isValidSolanaAddress } from "@nfteyez/sol-rayz";

import {
    REWARD_TOKEN_MINT,
    CLASS_TYPES,
    PROGRAM_ID,
    SECONDS_PER_DAY,
    LOCK_DAY,
    REWARDS_BY_RARITY,
    CHAINLINK_FEED,
    CHAINLINK_PROGRAM_ID,
    ZZZ_TOKEN_MINT,
    PYTH_ACCOUNT,
} from './constants';
import {
    getBuyerStateKey,
    getGlobalState,
    getZzzVaultKey,
    getRaffleKey,
    getRewardVaultKey,
    getAuctionKey,
    getBidderStateKey,
    getNftVaultKey,
    getNativeVaultKey
} from './keys';
import {
    getMultipleTransactions,
    sendMultiTransactions,
    getAssociatedTokenAccount,
    getNFTTokenAccount,
} from './utils';
import * as bs58 from "bs58";

import BigNumber from 'bignumber.js';

const IDL = require('./idl');

export const getProgram = (wallet, connection) => {
    let provider = new anchor.AnchorProvider(
        connection,
        wallet,
        anchor.AnchorProvider.defaultOptions()
    );
    const program = new anchor.Program(IDL, PROGRAM_ID, provider);
    return program;
};

export const initProject = async (wallet, connection) => {
    // console.log("On init click");
    const program = getProgram(wallet, connection);

    // let data = await program.account.globalState.fetch(await getGlobalState());
    const res = await program.methods.initialize().accounts({
        admin: wallet.publicKey,
        globalState: await getGlobalState(),
        nativeVault: await getNativeVaultKey(),
        zzzMint: ZZZ_TOKEN_MINT,
        zzzVault: await getZzzVaultKey(),
    }).rpc();
    console.log("Your transaction signature : ", res);
}

export const getZzzMintDecimals = async (connection) => {
    return await getMintDecimals(connection, ZZZ_TOKEN_MINT);
}

export const getMintDecimals = async (connection, mintPk) => {
    let mintInfo = await getMint(connection, mintPk);
    return mintInfo.decimals;
}

export const createRaffle = async (wallet, connection, name, ticketCount, ticketPrice, rewardMint, startTime, endTime, description, wlspot) => {
    const program = getProgram(wallet, connection);
    let data = await program.account.globalState.fetch(await getGlobalState());
    console.log('global state', wallet.publicKey.toBase58());
    let raffleId = data.raffleCount + 1;

    let decimals = 0;
    try {
        decimals = await getMintDecimals(connection, ZZZ_TOKEN_MINT);
    } catch (error) {
        console.log('invalid reward token', error);
        return 0;
    }

    let bnTicketPrice = new anchor.BN(ticketPrice * (10 ** decimals));
    let rewardMintPk = new PublicKey(rewardMint);
    const sourceAddr = await getAssociatedTokenAddress(rewardMintPk, wallet.publicKey);
    try {
        const accInfo = await getAccount(connection, sourceAddr);
    } catch (error) {
        console.log('User has not reward token', error);
        return;
    }

    const ix = await program.methods.createRaffle(raffleId, ticketCount, bnTicketPrice, new anchor.BN(startTime), new anchor.BN(endTime), name, description, "", "", wlspot, "").accounts({
        admin: wallet.publicKey,
        globalState: await getGlobalState(),
        raffle: await getRaffleKey(raffleId),
        rewardMint: rewardMintPk,
        rewardVault: await getRewardVaultKey(rewardMintPk),
        sourceAccount: sourceAddr,
    }).rpc();
    console.log('txHash =', ix);

    return raffleId;
}

export const setRaffle = async (wallet, connection, raffleId, name, ticketCount, ticketPrice, rewardMint, startTime, endTime, description) => {
    const program = getProgram(wallet, connection);

    const ix = await program.methods.setRaffle(raffleId, ticketCount, ticketPrice, startTime, endTime, rewardMint, name, description, "", "", 0, "").accounts({
        admin: wallet.publicKey,
        globalState: await getGlobalState(),
        raffle: await getRaffleKey(raffleId),
    }).rpc();
    console.log('txHash =', ix);
    return ix;
}

export const deleteRaffle = async (wallet, connection, raffleId) => {
    const program = getProgram(wallet, connection);

    const ix = await program.methods.deleteRaffle().accounts({
        admin: wallet.publicKey,
        globalState: await getGlobalState(),
        raffle: await getRaffleKey(raffleId),
    }).rpc();
    console.log('txHash =', ix);
    return ix;
}

export const getRaffleData = async (wallet, connection, raffleId) => {
    const program = getProgram(wallet, connection);
    let data = await program.account.raffle.fetch(await getRaffleKey(raffleId));

    let res = await program.account.buyerState.all(
        [
            {
                memcmp: {
                    offset: 8,
                    bytes: wallet.publicKey.toBase58(),
                }
            },
            {
                memcmp: {
                    offset: 40,
                    bytes: bs58.encode([raffleId]),
                }
            },
        ]
    );

    let userTickets = 0;
    for (let i = 0; i < res.length; i++) {
        userTickets += res[i].account.ticketNumEnd - res[i].account.ticketNumStart + 1;
    }

    return { data: data, userTickets: userTickets };
}

export const finishRaffle = async (wallet, connection, raffleId) => {
    const program = getProgram(wallet, connection);

    const ix = await program.methods.finishRaffle(raffleId).accounts({
        admin: wallet.publicKey,
        globalState: await getGlobalState(),
        raffle: await getRaffleKey(raffleId),
        pythAccount: PYTH_ACCOUNT,
    }).rpc();
    console.log('txHash =', ix);

    await setRaffleWinner(wallet, connection, raffleId);

    return true;
}

const findRaffleWinner = async (wallet, connection, raffleId) => {
    const program = getProgram(wallet, connection);
    const data = await getRaffleData(wallet, connection, raffleId);
    let buyers = await program.account.buyerState.all(
        [
            {
                memcmp: {
                    offset: 40,
                    bytes: bs58.encode([raffleId]),
                }
            },
        ]
    );

    let winner = buyers.find((ele) => ele.account.ticketNumStart <= data.data.winTicketNum && data.data.winTicketNum <= ele.account.ticketNumEnd);
    if (!winner) {
        console.log('Not Found Winner');
        return;
    }

    return winner;
}

export const setRaffleWinner = async (wallet, connection, raffleId) => {
    const program = getProgram(wallet, connection);

    let winner = await findRaffleWinner(wallet, connection, raffleId);
    if (!winner) {
        return;
    }

    const ix1 = await program.methods.setRaffleWinner(raffleId).accounts({
        admin: wallet.publicKey,
        globalState: await getGlobalState(),
        raffle: await getRaffleKey(raffleId),
        winnerState: winner.publicKey,
    }).rpc();
    console.log('txHash =', ix1);

    return true;
}

export const generateWlWinners = async (wallet, connection, raffleId) => {
    const program = getProgram(wallet, connection);

    let res = await program.account.buyerState.all(
        [
            {
                memcmp: {
                    offset: 40,
                    bytes: bs58.encode([raffleId]),
                }
            },
        ]
    );

    let buyers = [...res];
    console.log('all', res);

    let ticketCount = 0;
    for (let i = 0; i < buyers.length; i++) {
        let cnt = buyers[i].account.ticketNumEnd - buyers[i].account.ticketNumStart + 1;
        ticketCount += cnt;
    }

    let winners = [];
    while (buyers.length > 0 && winners.length < 2) {
        let ticketNum = Math.floor(Math.random() * ticketCount);
        console.log('random', ticketNum, ticketCount);
        // let ticketNum = await program.methods.genWlWinners(ticketCount).accounts({
        //     pythAccount: new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"),
        // }).view();
        let startNum = 1, endNum = 1;
        for (let i = 0; i < buyers.length; i++) {
            let cnt = buyers[i].account.ticketNumEnd - buyers[i].account.ticketNumStart + 1;
            endNum = startNum + cnt;
            if (startNum <= ticketNum && ticketNum < endNum) {
                winners.push(buyers[i]);
                ticketCount -= cnt;
                buyers.splice(i, 1);

                break;
            }
            startNum = endNum;
        }
    }
    console.log('winners', winners);
    return winners;
}

export const buyTicket = async (wallet, connection, raffleId, count) => {
    const program = getProgram(wallet, connection);
    let raffleKey = await getRaffleKey(raffleId);
    let data = await program.account.raffle.fetch(raffleKey);
    let ticketStartNum = data.soldTickets + 1;

    const sourceAddr = await getAssociatedTokenAddress(ZZZ_TOKEN_MINT, wallet.publicKey);
    try {
        let accInfo = await getAssociatedTokenAccount(wallet.publicKey, sourceAddr);
    } catch (error) {
        console.log('User has not pay token', error);
        return;
    }

    const ix = await program.methods.buyTicket(raffleId, count).accounts({
        user: wallet.publicKey,
        globalState: await getGlobalState(),
        raffle: raffleKey,
        buyerState: await getBuyerStateKey(wallet.publicKey, raffleId, ticketStartNum),
        zzzMint: ZZZ_TOKEN_MINT,
        zzzVault: await getZzzVaultKey(),
        sourceAccount: sourceAddr,
    }).rpc();
    console.log('txHash =', ix);
    return ix;
}

export const claimRewards = async (wallet, connection, raffleId) => {
    const program = getProgram(wallet, connection);

    const rafData = await getRaffleData(wallet, connection, raffleId);
    const data = rafData.data;
    if (data.closed == 0) {
        console.log('This raffle is not closed.', data);
        return;
    }
    if (data.claimed == 1) {
        console.log('Winner was already claimed.', data);
        return;
    }

    let winner = null;
    try {
        winner = await program.account.buyerState.fetch(data.winner);
    } catch (e) {
        console.log('winner fetch error', e);
    }
    if (!winner) {
        console.log('You are not winner', data.winTicketNum);
        return;
    }

    const destAtaAddr = await getAssociatedTokenAddress(data.rewardMint, wallet.publicKey);

    // claim_rewards
    const ix = await program.methods.claimRewards(raffleId).accounts({
        user: wallet.publicKey,
        raffle: await getRaffleKey(raffleId),
        buyerState: await getBuyerStateKey(wallet.publicKey, raffleId, winner.ticketNumStart),
        globalState: await getGlobalState(),
        rewardMint: data.rewardMint,
        rewardVault: await getRewardVaultKey(data.rewardMint),
        rewardToAccount: destAtaAddr,
    }).rpc();

    console.log('txHash =', ix);
    return ix;
}

export const createAuction = async (wallet, connection, sellerPk, nftMint, min_bid_amount, startTime, endTime, price, projectName, projectDescription) => {
    const program = getProgram(wallet, connection);
    let globalStateKey = await getGlobalState();
    let data = await program.account.globalState.fetch(globalStateKey);
    let auctionId = data.auctionCount + 1;

    let decimals = 0;
    try {
        decimals = await getMintDecimals(connection, ZZZ_TOKEN_MINT);
    } catch (error) {
        console.log('invalid reward token', error);
        return 0;
    }

    let bnBidPrice = new anchor.BN(price * (10 ** decimals));

    let nftTokenAcc = await getNFTTokenAccount(connection, nftMint);

    let ix = await program.methods.createAuction(auctionId, sellerPk, min_bid_amount, new anchor.BN(startTime), new anchor.BN(endTime), new anchor.BN(bnBidPrice), projectName, projectDescription).accounts({
        admin: wallet.publicKey,
        globalState: globalStateKey,
        auction: await getAuctionKey(auctionId),
        nftMint: nftMint,
        nftVault: await getNftVaultKey(nftMint),
        sourceAccount: nftTokenAcc,
    }).rpc();

    console.log('create auction', ix, auctionId);

    return auctionId;
}

export const getBidPrice = async (wallet, connection, auctionId) => {
    const program = getProgram(wallet, connection);
    const auctionKey = await getAuctionKey(auctionId);
    const data = await program.account.auction.fetch(auctionKey);

    let decimals = 0;
    try {
        decimals = await getMintDecimals(connection, ZZZ_TOKEN_MINT);
    } catch (error) {
    }
    let bnPrice = new BigNumber(data.price);
    let bigDecimal = new BigNumber(10 ** decimals);
    let uiPrice = bnPrice.div(bigDecimal).toNumber();
    console.log('auction data', uiPrice);

    return uiPrice;
}

export const placeBid = async (wallet, connection, auctionId, price) => {
    const program = getProgram(wallet, connection);
    let globalStateKey = await getGlobalState();
    const sourceAddr = await getAssociatedTokenAddress(ZZZ_TOKEN_MINT, wallet.publicKey);
    try {
        const accountInfo = await getAccount(connection, sourceAddr);
    } catch (error) {
        console.log('User has not pay token', error);
        return false;
    }

    let decimals = 0;
    try {
        decimals = await getMintDecimals(connection, ZZZ_TOKEN_MINT);
    } catch (error) {
        console.log('invalid pay token', error);
        return 0;
    }
    let bnPrice = new anchor.BN(price * (10 ** decimals));

    const ix = await program.methods.bid(auctionId, bnPrice).accounts({
        user: wallet.publicKey,
        globalState: globalStateKey,
        auction: await getAuctionKey(auctionId),
        bidderState: await getBidderStateKey(auctionId, wallet.publicKey),
        zzzMint: ZZZ_TOKEN_MINT,
        zzzVault: await getZzzVaultKey(),
        sourceAccount: sourceAddr,
    }).rpc();

    console.log('bid tx', ix);
    return true;
}

export const cancelBid = async (wallet, connection, auctionId) => {
    const program = getProgram(wallet, connection);
    let globalStateKey = await getGlobalState();
    const sourceAddr = await getAssociatedTokenAddress(ZZZ_TOKEN_MINT, wallet.publicKey);

    const ix = await program.methods.cancelBid(auctionId).accounts({
        user: wallet.publicKey,
        globalState: globalStateKey,
        auction: await getAuctionKey(auctionId),
        bidderState: await getBidderStateKey(auctionId, wallet.publicKey),
        zzzMint: ZZZ_TOKEN_MINT,
        zzzVault: await getZzzVaultKey(),
        refundReceiver: sourceAddr,
        nativeVault: await getNativeVaultKey(),
    }).rpc();

    console.log('cancel bid tx', ix);
}

export const finishAuction = async (wallet, connection, auctionId) => {
    const program = getProgram(wallet, connection);
    let globalStateKey = await getGlobalState();
    let auctionKey = await getAuctionKey(auctionId);
    let data = await program.account.auction.fetch(auctionKey);
    let nftMint = data.nftMint;

    let isCreateAta = false;
    const destAddr = await getAssociatedTokenAddress(nftMint, data.bidder);
    try {
        const accountInfo = await getAccount(connection, destAddr);
    } catch (e) {
        isCreateAta = true;
    }

    let tx_finish;
    if (!isCreateAta) {
        tx_finish = await program.methods.finishAuction(auctionId).accounts({
            admin: wallet.publicKey,
            globalState: globalStateKey,
            auction: auctionKey,
            nftVault: await getNftVaultKey(nftMint),
            nftMint: nftMint,
            nftReceiver: destAddr,
        }).rpc();
    } else {
        let tx = createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            destAddr,
            data.bidder,
            nftMint
        );

        tx_finish = await program.methods.finishAuction(auctionId).accounts({
            admin: wallet.publicKey,
            globalState: globalStateKey,
            auction: auctionKey,
            nftVault: await getNftVaultKey(nftMint),
            nftMint: nftMint,
            nftReceiver: destAddr,
        }).preInstructions([tx]).rpc();
    }
    console.log('tx_finish', tx_finish);

    return tx_finish;
}

export const bidRefund = async (wallet, connection, auctionId) => {
    const program = getProgram(wallet, connection);

    let res = await program.account.bidderState.all(
        [
            {
                memcmp: {
                    offset: 8,
                    bytes: bs58.encode([auctionId]),
                }
            },
        ]
    );

    let globalStateKey = await getGlobalState();
    let auctionKey = await getAuctionKey(auctionId);

    let instructions = [];
    for (let i = 0; i < res.length; i++) {
        let bidder = res[i].account.bidder;
        const ix = await program.methods.bidRefund(auctionId).accounts({
            admin: wallet.publicKey,
            globalState: globalStateKey,
            auction: auctionKey,
            bidder: bidder,
            bidderState: res[i].publicKey,
            zzzMint: ZZZ_TOKEN_MINT,
            zzzVault: await getZzzVaultKey(),
            destAccount: res[i].account.refundReceiver,
        }).instruction();
        instructions.push(ix);
    }

    let instructionSet = await getMultipleTransactions(connection, wallet, instructions);
    res = await sendMultiTransactions(connection, wallet, instructionSet);
    console.log('bidRefund', res);
    return res;
}

export const getAllRaffles = async (wallet, connection) => {
    const program = getProgram(wallet, connection);
    let res = await program.account.raffle.all();
    return res;
}

export const getAllAuctions = async (wallet, connection) => {
    const program = getProgram(wallet, connection);
    let res = await program.account.auction.all();
    return res;
}

export const getAuctionData = async (wallet, connection, auctionId) => {
    const program = getProgram(wallet, connection);
    let data = await program.account.auction.fetch(await getAuctionKey(auctionId));
    return data;
}
