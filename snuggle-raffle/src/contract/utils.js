import * as anchor from '@project-serum/anchor';
import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import {
  getSolanaMetadataAddress,
  decodeTokenMetadata,
  getParsedNftAccountsByOwner,
  isValidSolanaAddress,
  createConnectionConfig,
} from "@nfteyez/sol-rayz";
import axios from "axios";

const opts = {
  preflightCommitment: "processed"
}

const PACKET_DATA_SIZE = 1280 - 40 - 8;

/** Get provider of connected wallet on the current solana network */

/** Get Token Account Information */

export const getTokenAccount = async (connection, mintPk, userPk) => {
  let tokenAccount = await connection.getProgramAccounts(
    TOKEN_PROGRAM_ID,
    {
      filters: [
        {
          dataSize: 165
        },
        {
          memcmp: {
            offset: 0,
            bytes: mintPk.toBase58()
          }
        },
        {
          memcmp: {
            offset: 32,
            bytes: userPk.toBase58()
          }
        },
      ]
    }
  );
  return tokenAccount[0].pubkey;
}

export const getNFTTokenAccount = async (connection, nftMintPk) => {
  // console.log("getNFTTokenAccount nftMintPk=", nftMintPk.toBase58());  
  let tokenAccount = await connection.getProgramAccounts(
    TOKEN_PROGRAM_ID,
    {
      filters: [
        {
          dataSize: 165
        },
        {
          memcmp: {
            offset: 64,
            bytes: '2'
          }
        },
        {
          memcmp: {
            offset: 0,
            bytes: nftMintPk.toBase58()
          }
        },
      ]
    }
  );
  return tokenAccount[0].pubkey;
}

export const getAssociatedTokenAccount = async (ownerPubkey, mintPk) => {
  let associatedTokenAccountPubkey = (await PublicKey.findProgramAddress(
    [
      ownerPubkey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mintPk.toBuffer(), // mint address
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  ))[0];
  return associatedTokenAccountPubkey;
}

/** Get NFT Information */

export const getOwnerOfNFT = async (connection, nftMintPk) => {
  let tokenAccountPK = await getNFTTokenAccount(nftMintPk);
  let tokenAccountInfo = await connection.getAccountInfo(tokenAccountPK);

  // console.log("nftMintPk=", nftMintPk.toBase58());
  // console.log("tokenAccountInfo =", tokenAccountInfo);

  if (tokenAccountInfo && tokenAccountInfo.data) {
    let ownerPubkey = new PublicKey(tokenAccountInfo.data.slice(32, 64))
    // console.log("ownerPubkey=", ownerPubkey.toBase58());
    return ownerPubkey;
  }
  return new PublicKey("");
}

export const getAllNftData = async (wallet, connection) => {
  try {
    const result = isValidSolanaAddress(wallet.publicKey);
    if (result) {
      const nfts = await getParsedNftAccountsByOwner({
        publicAddress: wallet.publicKey.toBase58(),
        connection: connection,
        serialization: true,
      });

      return nfts;
    }
  } catch (error) {
    console.log(error);
  }
};


export const getNftMetadataURI = async (connection, nftMintPk) => {
  try {
    let nftMetadataAddr = await getSolanaMetadataAddress(nftMintPk);
    let metadataByte = await connection.getAccountInfo(nftMetadataAddr);
    let metadata = await decodeTokenMetadata(metadataByte.data);
    let uri = await axios.get(metadata.data.uri);
    return uri.data;
  } catch (e) {
    console.log("getNftMetadataURI: ", e);
  }
  // console.log("Metadata address = ", nftMetadataAddr);
  // console.log("Metadata : ", uri.data);
  return null;
}

/** Send Multiple Transactions */

export async function getMultipleTransactions(
  connection,
  wallet,
  instructions = [],
  signers = []
) {
  const recentBlockhash = (await connection.getRecentBlockhash("processed"))
    .blockhash;
  const instructionSet = splitTransaction(
    wallet,
    instructions,
    signers,
    recentBlockhash
  );
  // console.log("instructionSet =", instructionSet);
  return instructionSet;
}

export async function sendMultiTransactions(
  connection,
  wallet,
  instructionSet,
  signers = []
) {
  // console.log("sendMultiTransactions");
  let { txs, result } = await sendTransactions(
    connection,
    wallet,
    instructionSet,
    signers,
    SequenceType.Sequential,
    "single"
  );
  return { txs: txs, result: result };
}

function splitTransaction(
  wallet,
  instructions,
  signers = [],
  recentBlockhash
) {
  let arrIxSet = [];
  let setId = 0;
  for (let i = 0; i < instructions.length;) {
    if (arrIxSet[setId] === undefined) arrIxSet[setId] = [];
    arrIxSet[setId].push(instructions[i]);
    let tx = new Transaction().add(...arrIxSet[setId]);
    tx.recentBlockhash = recentBlockhash;
    tx.feePayer = wallet.publicKey;
    if (getTransactionSize(tx, signers) > PACKET_DATA_SIZE) {
      arrIxSet[setId].pop();
      setId++;
      continue;
    }
    i++;
  }
  return arrIxSet;
}

export function getTransactionSize(
  transaction,
  signers = [],
  hasWallet = true
) {
  const signData = transaction.serializeMessage();
  const signatureCount = [];
  encodeLength(signatureCount, signers.length);
  const transactionLength =
    signatureCount.length +
    (signers.length + (hasWallet ? 1 : 0)) * 64 +
    signData.length;
  return transactionLength;
}

function encodeLength(bytes, len) {
  let rem_len = len;
  for (; ;) {
    let elem = rem_len & 0x7f;
    rem_len >>= 7;
    if (rem_len === 0) {
      bytes.push(elem);
      break;
    } else {
      elem |= 0x80;
      bytes.push(elem);
    }
  }
}

export const sendTransactions = async (
  connection,
  wallet,
  instructionSet,
  signers,
  sequenceType = SequenceType.Parallel,
  commitment = "singleGossip",
  block
) => {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  // console.log("sendTransactions");

  let resStr = "success";
  const unsignedTxns = [];

  if (!block) {
    block = await connection.getRecentBlockhash(commitment);
  }

  for (let i = 0; i < instructionSet.length; i++) {
    const instructions = instructionSet[i];

    if (instructions.length === 0) {
      continue;
    }

    let transaction = new Transaction();
    instructions.forEach((instruction) => transaction.add(instruction));
    transaction.recentBlockhash = block.blockhash;
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    );

    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }

    unsignedTxns.push(transaction);
  }

  const signedTxns = await wallet.signAllTransactions(unsignedTxns);
  let txIds = [];
  if (signedTxns.length > 0) {
    if (signedTxns.length === 1) {
      // let confirming_id = showToast("Confirming Transaction ...", -1, 2);
      let txId = await sendSignedTransaction(connection, signedTxns[0]);
      txIds.push(txId);
      console.log('txId', txId);

      try {
        let res = await connection.confirmTransaction(txId, "confirmed");
        // toast.dismiss(confirming_id);
        if (res.value.err) resStr = "failed"; //showToast(`Transaction Failed`, 2000, 1);
        // else showToast(`Transaction Confirmed`, 2000)
      } catch (error) {
        resStr = "failed";
      }
    } else {
      // let confirming_id = showToast(`Confirming Transaction 1 of ${signedTxns.length}...`, -1, 2);
      for (let i = 0; i < signedTxns.length; i++) {
        // console.log("waiting", i);
        let txId = await sendSignedTransaction(connection, signedTxns[i]);
        txIds.push(txId);
        console.log('txId', txId);

        try {
          let res = await connection.confirmTransaction(txId, "confirmed");
          if (res.value.err) {
            resStr = "failed"; //showToast(`Transaction Failed`, 2000, 1);
            break;
          }
        } catch (error) {
          resStr = "failed"; //showToast(`Transaction Failed`, 2000, 1);
          break;
        }
        // else showToast(`Transaction Confirmed`, 2000)

        // if ( i + 2 <= signedTxns.length)
        //   toast.update(confirming_id, { render: `Confirming Transaction ${i+2} of ${signedTxns.length}...`});
        // else toast.dismiss(confirming_id);
      }
    }
  }
  return { result: resStr, number: signedTxns.length, txs: txIds };
};

export const SequenceType = {
  Sequential: 0,
  Parallel: 1,
  StopOnFailure: 2,
}

export async function sendSignedTransaction(
  connection,
  signedTransaction
) {
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const rawTransaction = signedTransaction.serialize();

  let maxTry = 10;
  let real_txid = "";

  while (maxTry > 0 && real_txid == "") {
    maxTry--;
    const txid = await connection.sendRawTransaction(
      rawTransaction,
      {
        skipPreflight: true,
        preflightCommitment: "confirmed",
      }
    );
    let softTry = 3;
    while (softTry > 0) {
      softTry--;
      await delay(700);

      // @ts-ignore
      const resp = await connection._rpcRequest("getSignatureStatuses", [
        [txid],
      ]);

      if (resp && resp.result && resp.result.value && resp.result.value[0]) {
        return txid;
      }
    }
  }

  return "";
}

export function exportToJsonFile(jsonData) {
  let dataStr = JSON.stringify(jsonData);
  let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

  let exportFileDefaultName = 'data.json';

  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}