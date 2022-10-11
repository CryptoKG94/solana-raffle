import { Grid, Typography, useMediaQuery } from "@mui/material";
import React from "react";
import { FilledButton } from "../../components/Buttons";
import nft from "../../images/nft.svg";
const Skate = () => {
  const match = useMediaQuery("(max-width:756px)");
  return (
    <Grid
      spacing={2}
      justifyContent="center"
      style={{ padding: match ? "2em" : "1em 4em" }}
      container
    >
      <Grid
        item
        justifyContent="space-between"
        xs={12}
        md={5.5}
        alignItems={"center"}
        style={{
          padding: "1em",
          backgroundColor: "#26a3ca",
          borderRadius: "12px",
          ...(match ? { marginTop: "1em" } : { marginRight: "1em" }),
        }}
        container
      >
        <Grid item>
          <Typography fontSize={20}> Wallet HDGFS...</Typography>
        </Grid>
        <Grid item>
          <Typography fontSize={20}>Balance:</Typography>
          <Typography fontSize={20}>5.7855 $Snuggle Squad</Typography>
        </Grid>
      </Grid>
      <Grid
        xs={12}
        md={5.5}
        item
        justifyContent="space-between"
        alignItems={"center"}
        style={{
          padding: "1em",
          backgroundColor: "#26a3ca",
          borderRadius: "12px",
          ...(match ? { marginTop: "1em" } : { marginRight: "1em" }),
        }}
        container
      >
        <Grid item>
          <Typography fontSize={20}> Rate:30.05 / day</Typography>
          <Typography>1-1.4x SOLrarify ranking multiplier</Typography>
        </Grid>
        <Grid item>
          <Typography fontSize={20}>Earned:</Typography>
          <Typography fontSize={20}>63.7577 $Snuggle Squad</Typography>
        </Grid>
      </Grid>
      <Grid container style={{ marginTop: "1em" }} justifyContent="center">
        <Grid
          item
          xs={12}
          md={5.5}
          style={{
            minHeight: "40vh",
            background: "#26a3ca",
            ...(match ? { marginTop: "1em" } : { marginRight: "1em" }),
            padding: "1em",
            borderRadius: "16px",
          }}
          container
          alignItems="flex-end"
        >
          <Grid item container justifyContent="flex-end" xs={12} spacing={1}>
            <Grid item>
              <FilledButton
                disabled={true}
                style={{ borderRadius: "10px", width: "5em" }}
              >
                Stake
              </FilledButton>
            </Grid>
            <Grid item>
              <FilledButton
                disabled={true}
                style={{ borderRadius: "10px", width: "5em" }}
              >
                Stake All
              </FilledButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          md={5.5}
          container
          alignItems="flex-end"
          style={{
            minHeight: "40vh",
            borderRadius: "16px",
            background: "#26a3ca",
            padding: "1em",
            ...(match ? { marginTop: "1em" } : { marginRight: "1em" }),
          }}
        >
          <Grid item container justifyContent="flex-end" xs={12} spacing={1}>
            <Grid item spacing={2} container xs={12}>
              <Grid item>
                <div
                  style={{
                    height: "7.5em",
                    background:
                      "linear-gradient(179.93deg, rgba(255, 255, 255, 0.54) 0.06%, rgba(255, 255, 255, 0) 184.66%)",
                    borderRadius: "20px",
                    padding: "2px",
                  }}
                >
                  <img
                    src={nft}
                    alt=""
                    style={{ borderRadius: "20px", height: "7.5em" }}
                  />
                </div>
              </Grid>
              <Grid item>
                <div
                  style={{
                    height: "7.5em",
                    background:
                      "linear-gradient(179.93deg, rgba(255, 255, 255, 0.54) 0.06%, rgba(255, 255, 255, 0) 184.66%)",
                    borderRadius: "20px",
                    padding: "2px",
                  }}
                >
                  <img
                    src={nft}
                    alt=""
                    style={{ borderRadius: "20px", height: "7.5em" }}
                  />
                </div>
              </Grid>{" "}
              <Grid item>
                <div
                  style={{
                    height: "7.5em",
                    background:
                      "linear-gradient(179.93deg, rgba(255, 255, 255, 0.54) 0.06%, rgba(255, 255, 255, 0) 184.66%)",
                    borderRadius: "20px",
                    padding: "2px",
                  }}
                >
                  <img
                    src={nft}
                    alt=""
                    style={{ borderRadius: "20px", height: "7.5em" }}
                  />
                </div>
              </Grid>{" "}
              <Grid item>
                <div
                  style={{
                    height: "7.5em",
                    background:
                      "linear-gradient(179.93deg, rgba(255, 255, 255, 0.54) 0.06%, rgba(255, 255, 255, 0) 184.66%)",
                    borderRadius: "20px",
                    padding: "2px",
                  }}
                >
                  <img
                    src={nft}
                    alt=""
                    style={{ borderRadius: "20px", height: "7.5em" }}
                  />
                </div>
              </Grid>{" "}
              <Grid item>
                <div
                  style={{
                    height: "7.5em",
                    background:
                      "linear-gradient(179.93deg, rgba(255, 255, 255, 0.54) 0.06%, rgba(255, 255, 255, 0) 184.66%)",
                    borderRadius: "20px",
                    padding: "2px",
                  }}
                >
                  <img
                    src={nft}
                    alt=""
                    style={{ borderRadius: "20px", height: "7.5em" }}
                  />
                </div>
              </Grid>{" "}
              <Grid item>
                <div
                  style={{
                    height: "7.5em",
                    background:
                      "linear-gradient(179.93deg, rgba(255, 255, 255, 0.54) 0.06%, rgba(255, 255, 255, 0) 184.66%)",
                    borderRadius: "20px",
                    padding: "2px",
                  }}
                >
                  <img
                    src={nft}
                    alt=""
                    style={{ borderRadius: "20px", height: "7.5em" }}
                  />
                </div>
              </Grid>
              <Grid item>
                <div
                  style={{
                    height: "7.5em",
                    background:
                      "linear-gradient(179.93deg, rgba(255, 255, 255, 0.54) 0.06%, rgba(255, 255, 255, 0) 184.66%)",
                    borderRadius: "20px",
                    padding: "2px",
                  }}
                >
                  <img
                    src={nft}
                    alt=""
                    style={{ borderRadius: "20px", height: "7.5em" }}
                  />
                </div>
              </Grid>
            </Grid>
            <Grid item>
              <FilledButton
                disabled={true}
                style={{ borderRadius: "10px", width: "5em" }}
              >
                Stake
              </FilledButton>
            </Grid>
            <Grid item>
              <FilledButton
                disabled={true}
                style={{ borderRadius: "10px", width: "5em" }}
              >
                Stake All
              </FilledButton>
            </Grid>
            <Grid item>
              <FilledButton style={{ borderRadius: "10px", width: "5em" }}>
                Claim
              </FilledButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Skate;
