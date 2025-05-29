# github-scanner

POC github scanner service, implmented with Node.jsm Typescript using express

## Local Installation

First, you need to have `nvm` installed.
can use

```shell
brew install nvm
# You should add some configuration after you install the NVM,
# please read the instructions from Brew.
```

Build the server, at the main folder

```bash
nvm install # for the first time only
nvm use
npm ci
npm run start:dev # the server prints the output
```

## Environment Configuration

Before running the service, you need to set up your environment variables:

1. Copy the example environment file:

```bash
cp example.env .env
```

2. Open the `.env` file and add your GitHub personal access token:

```
GITHUB_TOKEN=your_github_token_here
```

You can create a GitHub personal access token by:

1. Going to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate a new token with the necessary repository access permissions

## Querying Data

The service exposes a GraphQL API that you can use to query repository information. Here's an example query:

```graphql
query ExampleQuery($name: String!, $repoName2: String!) {
  repos {
    forks
    name
    numberOfFiles
    sizeInKB
    owner
    yamlFile {
      content
      name
    }
  }
  repo(name: $repoName2) {
    name
    owner
  }
}
```

You can execute this query using any GraphQL client (like GraphiQL, Postman, or Apollo Client) by sending a POST request to the GraphQL endpoint. The query accepts variables for filtering specific repositories.

Available fields in the response:

- `name`: Repository name
- `stars`: Number of stars
- `forks`: Number of forks
- `sizeInKB`: Repository size in kilobytes
- `numberOfFiles`: Total number of files
- `visibility`: Repository visibility status
- `owner`: Repository owner
- `webhooks`: List of webhooks with:
  - `id`: Webhook ID
  - `url`: Webhook URL
  - `events`: List of webhook events
  - `active`: Webhook active status
- `yamlFile`: YAML file information including:
  - `name`: YAML file name
  - `content`: YAML file content
