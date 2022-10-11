import React, { useState } from "react";
import { Box, Grid, Typography, useMediaQuery } from "@mui/material";
import { FilledButton } from "../../components/Buttons";
import { CustomTextField } from "../../components/TextField";
import { useMutation } from "@apollo/client";
import { CREATE_AUCTION } from "../../query/auction";
import { createAuction } from "../../contract/helper";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from '@solana/web3.js';

const inputs = [
  {
    Label: "Name",
    type: "text",
    state: "name",
  },
  {
    Label: "Starting Bid",
    type: "number",
    state: "starting_bid",
  },
  {
    Label: "Start Time",
    type: "datetime-local",
    state: "start_time",
  },
  {
    Label: "End Time",
    type: "datetime-local",
    state: "end_time",
  },
  {
    Label: "Nft Token",
    type: "text",
    state: "nft_token",
  },
  {
    Label: "Description",
    type: "text",
    maxRows: 3,
    state: "description",
  },
];

const Form = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [mutateFunction, { data, loading, error }] =
    useMutation(CREATE_AUCTION);
  if (error) {
    console.log(error);
  }

  const match = useMediaQuery("(max-width:756px)");
  const [state, setState] = useState({
    name: "auction",
    starting_bid: 0.1,
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date().toISOString().slice(0, 16),
    nft_token: "96ntGsWNqAyM9F6UccVJU5xuiJRL5PeCPGapwBtdtHC8",
    description: "new auction1",
  });

  const handleClick = async () => {

    let st_times = new Date(state.start_time).getTime();
    let end_times = new Date(state.end_time).getTime();

    let sellerPk = new PublicKey("D36zdpeXt7Agaatt97MiX9kWqwbjyVhMFoZBN2oMvQmZ");
    let nftMint = new PublicKey(state.nft_token);

    let auctionId = await createAuction(wallet, connection, sellerPk, nftMint, 1, st_times, end_times, Number(state.starting_bid), state.name, state.description);

  };

  return (
    <Grid container justifyContent="center" alignItems="center">
      <Grid
        sx={{
          backgroundColor: "#26a3ca",
          borderRadius: "12px",
          width: match ? "90%" : "50%",
          height: "100%",
          padding: "2%",
        }}
        container
        item
        justifyContent="center"
        align="center"
        spacing={1}
      >
        <Grid item xs={12} align="center">
          <Typography
            variant="h4"
            fontWeight={700}
            style={{ padding: "0 1% 2% 1%" }}
          >
            Create Auction
          </Typography>
        </Grid>

        <Grid
          item
          container
          style={{
            borderRadius: "12px",
            padding: "2% 0",
            height: "100%",
          }}
        >
          {inputs.map((input, index) => {
            return (
              <Grid
                item
                xs={12}
                alignItems="center"
                key={index}
                container
                style={{
                  padding: 0,
                  height: input.Label === "Description" ? "25%" : "15%",
                  marginBottom: "2%",
                }}
              >
                <Typography>{input.Label}</Typography>
                <CustomTextField
                  type={input.type}
                  value={state[input.state]}
                  onChange={(e) =>
                    setState((prev) => {
                      return {
                        ...prev,
                        [input.state]: e.target.value,
                      };
                    })
                  }
                  {...(input.type !== "datetime-local" &&
                    input.type !== "number" && { multiline: true })}
                  rows={input.maxRows ? input.maxRows : 1}
                  style={{ width: "95%" }}
                />
              </Grid>
            );
          })}
          <Grid
            item
            xs={12}
            style={{
              padding: "1% 0 0",
            }}
          >
            <FilledButton
              style={{ width: match ? "50%" : "30%" }}
              onClick={handleClick}
            >
              Create Auction
            </FilledButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Form;
