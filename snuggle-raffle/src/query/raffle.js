import { gql } from "@apollo/client";

export const CREATE_RAFFLE = gql`
  mutation CreateRaffle($raffle: RaffleInput!, $access_token: String!) {
    createRaffle(raffle: $raffle, access_token: $access_token) {
      name
    }
  }
`;

export const GET_RAFFLE = gql`
  query GetRaffle($id: ID) {
    getRaffle(id: $id) {
      id
      name
      ticket_count
      ticket_price
      start_time
      end_time
      reward_token
      description
      participants {
        wallet_address
      }
    }
  }
`;

export const GET_RAFFLES = gql`
  query GetRaffle {
    getRaffle {
      id
      name
      ticket_count
      end_time
    }
  }
`;

export const GET_RAFFLES_AND_AUCTIONS = gql`
  query ALL {
    getAuctions {
      id
      name
      end_time
      starting_bid
      history {
        bid_amount
      }
    }
    getRaffle {
      id
      name
      ticket_count
      end_time
    }
  }
`;
