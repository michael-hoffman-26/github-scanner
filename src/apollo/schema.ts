import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Webhook {
    id: Int!
    url: String!
    events: [String!]!
    active: Boolean!
  }

  type YamlFile {
    name: String!
    content: String!
  }

  type RepoDetails {
    name: String!
    stars: Int!
    forks: Int!
    sizeInKB: Int!
    numberOfFiles: Int!
    visibility: String!
    owner: String!
    webhooks: [Webhook!]!
    yamlFile: YamlFile
  }

  type Query {
    repos: [RepoDetails!]!
    repo(name: String!): RepoDetails
  }

  type Mutation {
    addRepo(repo: RepoInput!): RepoDetails!
  }

  input WebhookInput {
    id: Int!
    url: String!
    events: [String!]!
    active: Boolean!
  }

  input YamlFileInput {
    name: String!
    content: String!
  }

  input RepoInput {
    name: String!
    stars: Int!
    forks: Int!
    sizeInKB: Int!
    numberOfFiles: Int!
    visibility: String!
    owner: String!
    webhooks: [WebhookInput!]!
    yamlFile: YamlFileInput
  }
`;
