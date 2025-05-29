import { RepoScanQueue } from "../repo/RepoScanQueue";
import { githubFetcher } from "../services/githubFetcher";
import { dataRepository } from "../services/dataRepository";


/**
 * handling the queue manully, inserting the initData manully.
 * 
 * ideally the server should listen to a queue and work on 
 * each repo at a time.
 * for the parllel 
 */
export async function loadRepoData(): Promise<void> {
    const queue = new RepoScanQueue(2);
    queue.addMany([
        'michael-hoffman-26/recipe-vault', 
        'michael-hoffman-26/recipe-vault', 
        'michael-hoffman-26/recipe-vault'
    ]);

    while (!queue.isEmpty()) {
        const batch = queue.next(); // up to 2
        await Promise.all(batch.map(async (repo) => {
            const data = await githubFetcher.fetchRepoDetails(repo);
            dataRepository.save(data);
            queue.markDone(repo);
        }));
    }
}
