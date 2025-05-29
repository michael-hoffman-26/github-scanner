import { BaseError } from '../errors/baseError';
import { RepoDetails } from './githubFetcher';

interface RepoData {
    name: string;
    stars: number;
    forks: number;
    // Add more fields as needed
}

export class DataRepositoryError extends BaseError {
    constructor(message: string) {
        super('de', 404, message);
        this.name = 'DataRepositoryError';
    }
}

class DataRepository {
    private storage: Map<string, RepoDetails> = new Map();

    async save(data: RepoDetails): Promise<void> {
        try {
            this.storage.set(data.name, data);
            // Here you could add persistence logic (e.g., saving to a database)
            // For now, we're just storing in memory
        } catch (error) {
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            throw new DataRepositoryError(`Failed to save repo data: ${errorMessage}`);
        }
    }

    async get(repoName: string): Promise<RepoDetails | undefined> {
        return this.storage.get(repoName);
    }

    async getAll(): Promise<RepoDetails[]> {
        return Array.from(this.storage.values());
    }
}

// Create and export a singleton instance
export const dataRepository = new DataRepository(); 