import React, { useState, useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import nft from "../images/nft.svg";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getZzzMintDecimals } from "../contract/helper";

const DetailsCard = ({ details, type }) => {
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
      sx={{ backgroundColor: "#21C7FB", padding: "1em", borderRadius: "26px" }}
    >
      <Grid
        item
        container
        xs={12}
        justifyContent="center"
        alignItems="center"
        spacing={3}
      >
        <Grid item>
          <ArrowCircleLeftIcon style={{ opacity: "0.8" }} />
        </Grid>
        <Grid item>
          <Typography fontSize={20} fontWeight={600}>
            Prize 1{" "}
          </Typography>
        </Grid>
        <Grid item>
          <ArrowCircleRightIcon style={{ opacity: "0.8" }} />
        </Grid>
      </Grid>
      <div
        style={{
          margin: "1em 0",
          backgroundImage: `url(${nft})`,
          backgroundSize: "cover",
          height: "250px",
          borderRadius: "20px",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <Typography fontSize={20} fontWeight={600}>
        Test #713
      </Typography>
      {type === "raf" ? (
        <Typography fontSize={16} fontWeight={200}>
          Amount: {details?.ticketPrice?.toString()}
        </Typography>
      ) : (
        <Typography fontSize={16} fontWeight={200}>
          {details.bidderCount > 0 ? "Current Bid: " : "Starting Bid: "}{" "}
          {convertToUIPrice(details.price)}
        </Typography>
      )}
      <Typography
        sx={{ marginTop: "0.7em", marginBottom: "0.5em" }}
        fontSize={16}
        fontWeight={200}
      >
        Description:
      </Typography>
      <Typography
        fontSize={13}
        fontWeight={200}
        sx={{ height: "150px", textOverflow: "ellipsis", overflow: "hidden" }}
      >
        {details.projectDescription}
      </Typography>
    </Box>
  );
};

export default DetailsCard;
