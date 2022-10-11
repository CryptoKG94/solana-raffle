import React, { useState } from "react";
import { Box, Grid, Typography, useMediaQuery } from "@mui/material";
import { FilledButton } from "../../components/Buttons";
import { CustomTextField } from "../../components/TextField";
import { useMutation } from "@apollo/client";
import { CREATE_RAFFLE } from "../../query/raffle";
import { createRaffle, initProject } from "../../contract/helper";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

const inputs = [
  {
    Label: "Name",
    type: "text",
    state: "name",
  },
  {
    Label: "Ticket Count",
    type: "number",
    state: "ticket_count",
  },
  {
    Label: "Ticket Price",
    type: "number",
    state: "ticket_price",
  },
  {
    Label: "Reward Token",
    type: "text",
    state: "reward_token",
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
    Label: "Description",
    type: "text",
    maxRows: 3,
    state: "description",
  },
];

const Form = () => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const [mutateFunction, { data, loading, error }] = useMutation(CREATE_RAFFLE);
  if (error) {
    console.log(error);
  }
  const match = useMediaQuery("(max-width:756px)");
  const [state, setState] = useState({
    name: "raffle",
    ticket_count: 10,
    ticket_price: 0.1,
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date().toISOString().slice(0, 16),
    reward_token: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
    description: "new raffle1",
  });

  const [raffle_type, setRaffleType] = useState(0);
  const [wl_spot_count, setWlSpotCount] = useState(1);


  const onInit = async () => {
    await initProject(wallet, connection);
  }

  const handleClick = async () => {

    let st_times = new Date(state.start_time).getTime();
    let end_times = new Date(state.end_time).getTime();

    let wlspot = 0;
    if (raffle_type == '1') {
      // wlspot, no nft
      wlspot = Number(wl_spot_count);
    }

    let raffleId = await createRaffle(wallet, connection, state.name, parseInt(state.ticket_count), parseInt(state.ticket_price), state.reward_token, st_times, end_times, state.description, wlspot);

    if (raffleId == 0) {
      return;
    }

    // mutateFunction({
    //   variables: {
    //     access_token:
    //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmNlNWU1Y2Y4OWVkZmVkYjVmZDcyYjAiLCJpYXQiOjE2NTc5MDM3MzIsImV4cCI6MTY1NzkxNDUzMiwidHlwZSI6IkFjY2VzcyJ9.Jw12GKpMY5T0yEhJLSVw9A2UaqpGeGbkCWXtgQ87SFI",
    //     raffle: {
    //       raffle_id: 1,//raffleId,
    //       name: state.name,
    //       ticket_count: parseInt(state.ticket_count),
    //       ticket_price: parseInt(state.ticket_price),
    //       start_time: state.start_time,
    //       end_time: state.end_time,
    //       reward_token: state.reward_token,
    //       description: state.description,
    //     },
    //   },
    // });
  };

  return (
    <Grid container justifyContent="center" alignItems="center">
      <Grid
        sx={{
          backgroundColor: "#26a3ca",
          borderRadius: "12px",
          width: match ? "90%" : "50%",
          padding: "2%",
        }}
        container
        item
        align="center"
        spacing={1}
      >
        <Grid item style={{ padding: "0 0 3%" }}>
          <Typography variant="h4" fontWeight={700}>
            Create Raffle
          </Typography>
        </Grid>
        <FilledButton
          style={{ width: match ? "50%" : "30%" }}
          onClick={onInit}
        >
          Initialize
        </FilledButton>

        <Grid item container spacing={1}>
          <Grid item container xs={12}>
            <Typography>Raffle type</Typography>
            <select name="raffletype" id="raffletype" value={raffle_type} onChange={(e) => setRaffleType(e.target.value)}>
              <option value="0">Nft</option>
              <option value="1">WlSpot</option>
            </select>
          </Grid>
          {
            raffle_type == '1' && (
              <Grid item container xs={12}>
                <Typography>Wl Spot Count</Typography>
                <CustomTextField
                  type='number'
                  fullWidth
                  value={wl_spot_count}
                  onChange={(e) => setWlSpotCount(e.target.value)}
                  style={{ width: "95%" }}
                />
              </Grid>
            )
          }

          {inputs.map((input, index) => {
            return (
              <Grid item container xs={12} key={index}>
                <Typography>{input.Label}</Typography>
                <CustomTextField
                  type={input.type}
                  fullWidth
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
              Create Raffle
            </FilledButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Form;
