import React, { useState, useEffect } from "react";
import { Box, Grid, Typography, useMediaQuery } from "@mui/material";
import Card from "../../components/DetailsCard";
import { FilledButton } from "../../components/Buttons";
import Table from "../../components/Table";
import { useQuery } from "@apollo/client";
import { GET_RAFFLE } from "../../query/raffle";
import { GET_AUCTION } from "../../query/auction";
import { useParams } from "react-router-dom";
import {
  buyTicket, finishRaffle, claimRewards, placeBid, cancelBid, getBidPrice,
  finishAuction, bidRefund, getRaffleData, getAuctionData, setRaffleWinner, generateWlWinners
} from "../../contract/helper";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { CustomTextField } from "../../components/TextField";
import { exportToJsonFile } from "../../contract/utils";

const Details = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { id, type } = useParams();
  // const raf = useQuery(GET_RAFFLE, {
  //   variables: { id: id },
  // });
  // const auc = useQuery(GET_AUCTION, {
  //   variables: { id: id },
  // });
  const [isLoading, setIsLoading] = useState(false);
  const [raf, setRaffle] = useState({});
  const [auc, setAuction] = useState({});
  const [myTickets, setMyTickets] = useState(0);

  useEffect(() => {
    fetchFromContract();
  }, [wallet.publicKey]);

  const fetchFromContract = async () => {
    if (!wallet.publicKey) {
      return;
    }
    setIsLoading(true);
    if (type == 'raf') {
      let tmpRaf = await getRaffleData(wallet, connection, id);
      setRaffle(tmpRaf.data);
      setMyTickets(tmpRaf.userTickets);
      console.log('raffle data', tmpRaf);
      setAuction({});
    } else {
      let tmpAuc = await getAuctionData(wallet, connection, id);
      setAuction(tmpAuc);
      console.log('auction data', tmpAuc);
      setRaffle({});
    }
    setIsLoading(false);
  }

  const [ticketCount, setTicketCount] = useState(0);

  const onBuyTickets = async () => {
    let raffleId = raf.raffleId;
    let count = ticketCount;

    await buyTicket(wallet, connection, raffleId, count);
  }

  const onPlaceBid = async () => {
    let auctionId = auc.auctionId;
    let curBidPrice = await getBidPrice(wallet, connection, auctionId);
    let bidPrice = ticketCount;

    if (bidPrice <= curBidPrice) {
      alert('bid price is too low');
      return;
    }

    if (await placeBid(wallet, connection, auctionId, ticketCount) == false) {
      alert('you have no zzz token');
    }
  }

  const onCancelBid = async () => {
    let auctionId = auc.auctionId;
    await cancelBid(wallet, connection, auctionId);
  }

  const onFinishAuction = async () => {
    let auctionId = auc.auctionId;
    await finishAuction(wallet, connection, auctionId);
  }

  const onRefundAuction = async () => {
    let auctionId = auc.auctionId;
    await bidRefund(wallet, connection, auctionId);
  }

  const onFinishRaffle = async () => {
    let raffleId = raf.raffleId;
    await finishRaffle(wallet, connection, raffleId);
  }

  const onSetRaffleWinnerInfo = async () => {
    let raffleId = raf.raffleId;
    await setRaffleWinner(wallet, connection, raffleId);
  }

  const onExportWlSpotWinners = async () => {
    let raffleId = raf.raffleId;
    let winners = await generateWlWinners(wallet, connection, raffleId);

    let jsonData = {winners: winners};
    exportToJsonFile(jsonData);

  }

  const onClaimRewards = async () => {
    let raffleId = raf.raffleId;
    await claimRewards(wallet, connection, raffleId);
  }

  const match = useMediaQuery("(max-width:756px)");
  return (
    <Box sx={{ padding: match ? "1em" : "1em 4em" }}>
      {!isLoading && (
        <Grid
          item
          container
          xs={12}
          sx={{
            backgroundColor: "rgba(0,0,0,0.2)",
            borderRadius: "26px",
            padding: "1em",
          }}
          alignItems="flex-start"
        >
          <Grid sx={{ padding: match ? "1em" : "2em" }} item xs={12} md={4}>
            {type == "raf" && (
              <Card details={raf} type="raf" />
            )}
            {type != "raf" && (
              <Card details={auc} type="auc" />
            )}
          </Grid>
          <Grid
            item
            xs={12}
            md={8}
            spacing={4}
            sx={{ padding: "1.5em" }}
            container
          >
            <Grid item xs={12}>
              <Typography fontSize={25} fontWeight={600}>
                {type == "raf" &&
                  raf.projectName + " #" + raf.raffleId}
                {type != "raf" &&
                  auc.projectName + " #" + auc.auctionId}
              </Typography>
            </Grid>
            {
              type == "raf" && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography fontSize={15} fontWeight={200}>
                      Tickets Sold
                    </Typography>
                    <Typography fontSize={20} fontWeight={400}>
                      {raf.soldTickets}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography fontSize={15} fontWeight={200}>
                      My Tickets
                    </Typography>
                    <Typography fontSize={20} fontWeight={400}>
                      {myTickets}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography fontSize={15} fontWeight={200}>
                      Total Tickets
                    </Typography>
                    <Typography fontSize={20} fontWeight={400}>
                      {raf.ticketCount}
                    </Typography>
                  </Grid>
                </>
              )
            }
            <Grid item xs={12} md={6}>
              <Typography fontSize={15} fontWeight={200}>
                Duration
              </Typography>
              {raf.data && raf.data.getRaffle[0] ? (
                new Date(parseInt(raf.data.getRaffle[0].end_time)) <
                  new Date() ? (
                  <Typography fontSize={20} fontWeight={400}>
                    Raffle Ended!
                  </Typography>
                ) : (
                  <Typography fontSize={20} fontWeight={400}>
                    Ends in : 1d 20h 35m 30s
                  </Typography>
                )
              ) : auc.data &&
                auc.data.getAuctions[0] &&
                new Date(parseInt(auc.data.getAuctions[0].end_time)) <
                new Date() ? (
                <Typography fontSize={20} fontWeight={400}>
                  Auction Ended!
                </Typography>
              ) : (
                <Typography fontSize={20} fontWeight={400}>
                  Ends in : 1d 20h 35m 30s
                </Typography>
              )}
            </Grid>{" "}
            {/* {raf.data && raf.data.getRaffle[0] && (
              <Grid item xs={12} md={6}>
                <Typography fontSize={15} fontWeight={200}>
                  Price
                </Typography>
                <Typography fontSize={20} fontWeight={400}>
                  5 $Snuggle Squad/Tickets
                </Typography>
              </Grid>
            )} */}
            {/* {type != "raf" && (
              <Grid item xs={12} md={6}>
              <Typography fontSize={15} fontWeight={200}>
                Price
              </Typography>
              <Typography fontSize={20} fontWeight={400}>
                5 $Snuggle Squad/Tickets
              </Typography>
            </Grid>
            )} */}
            <Grid item xs={12}>
              <Typography fontSize={15} fontWeight={200}>
                Result
              </Typography>
              <Typography fontSize={20} fontWeight={400}>
                {
                  type != "raf" ? (auc?.closed == 1 ? auc?.bidder?.toBase58() : "") : (raf?.closed == 1 ? raf?.winner?.toBase58() : "")
                }
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} container spacing={1}>
              {type == "raf" && (
                <Grid item xs={12}>
                  <Typography fontSize={15} fontWeight={200}>
                    No of Tickets
                  </Typography>
                </Grid>
              )}
              {type != "raf" && (
                <Grid item xs={12}>
                  <Typography fontSize={15} fontWeight={200}>
                    Your Bid
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  value={ticketCount}
                  onChange={(e) => setTicketCount(e.target.value)}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <FilledButton sx={{ width: match ? "50%" : "15%", fontSize: 15 }} onClick={() => type == "raf" ? onBuyTickets() : onPlaceBid()}>
                {type == "raf" && "Buy Tickets"}
                {type != "raf" && "Place Bid"}
              </FilledButton>
              <FilledButton sx={{ width: match ? "50%" : "15%", fontSize: 15 }} onClick={() => type == "raf" ? onFinishRaffle() : onFinishAuction()}>
                {type == "raf" && "Finish Raffle"}
                {type != "raf" && "Finish Auction"}
              </FilledButton>
              <FilledButton sx={{ width: match ? "50%" : "15%", fontSize: 15 }} onClick={() => type == "raf" ? onClaimRewards() : onCancelBid()} >
                {type == "raf" && "Claim Rewards"}
                {type != "raf" && "Cancel Bid"}
              </FilledButton>
              {type == "raf" && (
                <FilledButton sx={{ width: match ? "50%" : "15%", fontSize: 15 }} onClick={() => onSetRaffleWinnerInfo()} >
                  Set Winner Info
                </FilledButton>
              )}
              {type == "raf" && (
                <FilledButton sx={{ width: match ? "50%" : "15%", fontSize: 15 }} onClick={() => onExportWlSpotWinners()} >
                  Export WlSpot Winners
                </FilledButton>
              )}
              {type != "raf" && (
                <FilledButton sx={{ width: match ? "50%" : "15%", fontSize: 15 }} onClick={() => onRefundAuction()} >
                  Refund
                </FilledButton>
              )}
            </Grid>
          </Grid>
        </Grid>
      )}
      {raf.data &&
        raf.data.getRaffle[0] &&
        raf.data.getRaffle[0].participants &&
        raf.data.getRaffle[0].participants.length && (
          <Box sx={{ marginTop: "2em" }}>
            <Typography fontSize={30} fontWeight={600}>
              Raffle History
            </Typography>
            <Table details={raf.data.getRaffle[0].participants} />
          </Box>
        )}
      {auc.data &&
        auc.data.getAuctions[0] &&
        auc.data.getAuctions[0].history.length && (
          <Box sx={{ marginTop: "2em" }}>
            <Typography fontSize={30} fontWeight={600}>
              Auction History
            </Typography>
            <Table details={auc.data.getAuctions[0].history} />
          </Box>
        )}
    </Box>
  );
};

export default Details;
