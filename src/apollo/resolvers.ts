import { RepoDetails } from '../services/githubFetcher';

// In-memory storage using Map
const repos = new Map<string, RepoDetails>();

export const resolvers = {
    Query: {
        repos: async () => {
            return Array.from(repos.values());
        },
        repo: async (_: unknown, { name }: { name: string }) => {
            const repo = repos.get(name);
            if (!repo) {
                throw new Error(`Repo with name ${name} not found`);
            }
            return repo;
        },
    },

    Mutation: {
        addRepo: (_: unknown, { repo }: { repo: RepoDetails }) => {
            if (repos.has(repo.name)) {
                throw new Error(`Repo with name ${repo.name} already exists`);
            }
            // Ensure numberOfFiles is a number
            if (typeof repo.numberOfFiles !== 'number') {
                console.error('numberOfFiles is not a number:', repo.numberOfFiles);
                repo.numberOfFiles = 0; // Set a default value
            }
            repos.set(repo.name, repo);
            return repo;
        },
    },
};
