require('dotenv').config()
import { loadRepoData } from './utils/load-data';
import { startApolloServer } from './apollo/server';



(async () => {

    await loadRepoData()

    startApolloServer();
})().catch(error => {
    console.error('Failed to start the application:', error);
    process.exit(1);
});