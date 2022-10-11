import { gql } from "@apollo/client";

export const CREATE_AUCTION = gql`
  mutation CreateAuction($auction: AuctionInput!, $access_token: String!) {
    createAuction(auction: $auction, access_token: $access_token) {
      name
    }
  }
`;

export const GET_AUCTION = gql`
  query GetAuctions($id: ID) {
    getAuctions(id: $id) {
      id
      name
      description
      start_time
      end_time
      reward_token
      starting_bid
      history {
        user {
          wallet_address
        }
        bid_amount
      }
    }
  }
`;

export const GET_AUCTIONS = gql`
  query GetAuctions {
    getAuctions {
      id
      name
      end_time
      starting_bid
      history {
        bid_amount
      }
    }
  }
`;
