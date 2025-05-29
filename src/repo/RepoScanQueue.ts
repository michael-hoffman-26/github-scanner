// src/domain/RepoScanQueue.ts

export class RepoScanQueue {
    private queue: string[];
    private inProgress: Set<string>;
    private concurrencyLimit: number;

    constructor(concurrencyLimit = 2) {
        this.queue = [];
        this.inProgress = new Set();
        this.concurrencyLimit = concurrencyLimit;
    }

    add(repoName: string) {
        if (!this.queue.includes(repoName) && !this.inProgress.has(repoName)) {
            this.queue.push(repoName);
        }
    }

    addMany(repoNames: string[]) {
        repoNames.forEach(name => this.add(name));
    }

    next(): string[] {
        const available = this.concurrencyLimit - this.inProgress.size;
        const nextBatch = this.queue.splice(0, available);

        nextBatch.forEach(name => this.inProgress.add(name));

        return nextBatch;
    }

    markDone(repoName: string) {
        this.inProgress.delete(repoName);
    }

    isEmpty(): boolean {
        return this.queue.length === 0 && this.inProgress.size === 0;
    }
}
  