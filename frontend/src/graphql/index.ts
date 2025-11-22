import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from "@apollo/client";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

function createWSLink() {
  return new GraphQLWsLink(
    createClient({
      url: `ws://localhost:4000/graphql`,
      connectionParams: {
        headers: {
          "x-cookie": `${document.cookie};`,
        },
      },
    })
  );
}
function createGraphQLHttpLink() {
  return createHttpLink({
    uri: `http://localhost:4000/graphql`,
    headers: {
      "x-cookie": `${document.cookie};`,
    },
  });
}

export function createApolloClient() {
  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    createWSLink(),
    createGraphQLHttpLink()
    // createGraphQLUploadLink(sessionId)
  );

  return new ApolloClient({
    link,
    credentials: "include",
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "no-cache",
      },
      query: {
        fetchPolicy: "no-cache",
      },
    },
  });
}
