import React, { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { FilledButton } from "./Buttons";
import { Link } from "react-router-dom";

import nft from "../images/nft.svg";
import card from "../images/card.svg";
import coins from "../images/coins.svg";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getZzzMintDecimals } from "../contract/helper";

const RaffleCard = ({ details, type }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [decimals, setDecimals] = useState(0);
  useEffect(() => {
    fetchDecimalsFromContract();
  }, []);

  const fetchDecimalsFromContract = async () => {
    setDecimals(await getZzzMintDecimals(connection));
  }

  const convertToUIPrice = (price) => {
    return Number(price) / (10 ** decimals);
  }

  return (
    <Box
      sx={{
        width: "250px",
        background:
          "linear-gradient(180deg, #26A3CA 0%, rgba(38, 163, 202, 0.2) 100%)",
        border: "1px solid rgba(32, 148, 185, 0.3)",
        padding: "10px",
        borderRadius: "16px",
      }}
    >
      <Box
        sx={{
          background: "#26A3CA",
          borderRadius: "0px 0px 12px 12px",
          width: "100%",
          backgroundImage: `url(${card})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            backgroundImage: `url(${nft})`,
            backgroundSize: "cover",
            height: "200px",
            borderRadius: "12px 12px 0px 0px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div style={{ padding: "1em 0" }}>
          <Typography
            color={"white"}
            fontSize={20}
            fontWeight={700}
            textAlign="center"
          >
            {details.account.projectName}
          </Typography>
          {type === "raf" ? (
            <>
              <Grid
                item
                xs={12}
                style={{ padding: "1em" }}
                container
                justifyContent={"center"}
              >
                <Grid
                  item
                  xs={6}
                  container
                  justifyContent={"flex-start"}
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item>
                    <img src={coins} alt="coins" />{" "}
                  </Grid>{" "}
                  <Grid item>
                    <Typography fontWeight="600" color="white">
                      {" "}
                      {details.account.soldTickets} sold
                    </Typography>
                  </Grid>{" "}
                </Grid>
                <Grid item>
                  <Typography color="white" fontWeight="600">
                    {details.account.closed == 1 ? "1 Winner" : "0 Winner"}
                  </Typography>
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                container
                justifyContent={"center"}
                alignItems="center"
                spacing={1}
              >
                <Grid item>
                  <CircleIcon
                    style={{
                      color: "#E2E2E2",
                      marginTop: "5px",
                      fontSize: "small",
                    }}
                  />
                </Grid>{" "}
                <Grid item>
                  <Typography fontWeight="600" color="white">
                    {" "}
                    { details.account.closed == 1
                      ? "Raffle Closed!"
                      : "Raffle Opened"}
                  </Typography>
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <Grid
                item
                xs={12}
                style={{ padding: "1em" }}
                container
                justifyContent={"center"}
              >
                <Grid
                  item
                  xs
                  container
                  justifyContent={"center"}
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item>
                    <Typography fontWeight="600" color="white">
                      {details.account.bidderCount > 0
                        ? "Current Bid: "
                        : "Starting Bid: "}{" "}
                      {convertToUIPrice(details.account.price)}
                    </Typography>
                  </Grid>{" "}
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                container
                justifyContent={"center"}
                alignItems="center"
                spacing={1}
              >
                <Grid item>
                  <CircleIcon
                    style={{
                      color: "#E2E2E2",
                      marginTop: "5px",
                      fontSize: "small",
                    }}
                  />
                </Grid>{" "}
                <Grid item>
                  <Typography fontWeight="600" color="white">
                    {" "}
                    { details.account.closed == 1
                      ? "Auction Closed!"
                      : "Auction Open!"}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </div>
        <Grid
          item
          container
          xs={12}
          justifyContent="center"
          style={{ paddingBottom: "1em" }}
        >
          <FilledButton
            component={Link}
            to={`/details/${type === "raf" ? details.account.raffleId : details.account.auctionId}/${type}`}
            sx={{ borderRadius: "16px", width: "70%", height: "2em" }}
          >
            {new Date(parseInt(details.account.end_time)) < new Date()
              ? "View Winner!"
              : "Place Bid!"}
          </FilledButton>
        </Grid>
      </Box>{" "}
    </Box>
  );
};

export default RaffleCard;
