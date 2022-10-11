import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: "https://api-snuggle-squad.herokuapp.com/graphql",
  cache: new InMemoryCache(),
});
