import { createApp } from './app';
import { loadRepoData } from './utils/load-data';

(async () => {
    const app = createApp();
    const PORT = process.env.PORT || 9090;

    await loadRepoData()

    app.listen(PORT, function () {
        console.log(`App is listening on port: ${PORT}!`);
    });
})().catch(error => {
    console.error('Failed to start the application:', error);
    process.exit(1);
});