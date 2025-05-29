import { RepoScanQueue } from "../repo/RepoScanQueue";
import { githubFetcher } from "../services/githubFetcher";
import { resolvers } from "../apollo/resolvers";


/**
 * handling the queue manully, inserting the initData manully.
 * 
 * ideally the server should listen to a message queue and work on 
 * each repo at a time.
 */
export async function loadRepoData(): Promise<void> {
    const queue = new RepoScanQueue(2);
    queue.addMany([
        'michael-hoffman-26/GreenridgeAppA',
        'mhoffman-26-recipe/GreenridgeAppB',
        'mhoffman-26-recipe/GreenridgeAppC'
    ]);

    while (!queue.isEmpty()) {
        const batch = queue.next(); // up to 2
        await Promise.all(batch.map(async (repo) => {
            const data = await githubFetcher.fetchRepoDetails(repo);

            await resolvers.Mutation.addRepo(null, { repo: data });
            queue.markDone(repo);
        }));
    }
}
