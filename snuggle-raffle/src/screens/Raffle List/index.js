import React, { useState } from "react";
import { Grid, useMediaQuery } from "@mui/material";
import Card from "../../components/RaffleCard";
import { OutlinedButton, FilledButton } from "../../components/Buttons";
import { useQuery } from "@apollo/client";
import { GET_RAFFLES } from "../../query/raffle";
import { GET_AUCTION } from "../../query/auction";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { getAllAuctions, getAllRaffles } from "../../contract/helper";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

const RaffleList = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  // const raf = useQuery(GET_RAFFLES);
  // const auc = useQuery(GET_AUCTION);
  const [raf, setRaffle] = useState([]);
  const [auc, setAuction] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const match = useMediaQuery("(max-width:756px)");
  const [state, setState] = useSearchParams();
  useEffect(() => {
    if (!state.get("type")) {
      state.set("type", "raf");
      setState(state);
    }

    fetchFromContract();
  }, [wallet.publicKey]);

  const fetchFromContract = async () => {
    if (!wallet.publicKey) {
      return;
    }

    setIsLoading(true);
    let tmpRaf = await getAllRaffles(wallet, connection);
    let tmpAuc = await getAllAuctions(wallet, connection);
    setRaffle(tmpRaf);
    setAuction(tmpAuc);
    setIsLoading(false);
  }

  return (
    <Grid container spacing={3}>
      <Grid item container xs={12} justifyContent="center" spacing={1}>
        {state.get("type") === "raf" ? (
          <>
            <Grid item xs={2.7} md={1.2}>
              <FilledButton
                onClick={() => {
                  state.set("type", "raf");
                  setState(state);
                }}
              >
                Raffles
              </FilledButton>
            </Grid>
            <Grid item xs={2.7} md={1.2}>
              <OutlinedButton
                onClick={() => {
                  state.set("type", "auc");
                  setState(state);
                }}
              >
                Auctions
              </OutlinedButton>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={2.7} md={1.2}>
              <OutlinedButton
                onClick={() => {
                  state.set("type", "raf");
                  setState(state);
                }}
              >
                Raffles
              </OutlinedButton>
            </Grid>
            <Grid item xs={2.7} md={1.2}>
              <FilledButton
                onClick={() => {
                  state.set("type", "auc");
                  setState(state);
                }}
              >
                Auctions
              </FilledButton>
            </Grid>
          </>
        )}
      </Grid>
      {!isLoading && (
        <Grid
          item
          container
          xs={12}
          style={{ padding: match ? "1em" : "2em 5em" }}
          // justifyContent={match ? "center" : "flex-start"}
          justifyContent="center"
          spacing={2}
        >
          {state.get("type") === "raf"
            ? raf?.map((details) => (
                <Grid item key={details.account.raffleId}>
                  <Card details={details} type="raf" />
                </Grid>
              ))
            : auc?.map((details) => (
                <Grid item key={details.account.auctionId}>
                  <Card details={details} type="auc" />
                </Grid>
              ))}
        </Grid>
      )}
    </Grid>
  );
};

export default RaffleList;
