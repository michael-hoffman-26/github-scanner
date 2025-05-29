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