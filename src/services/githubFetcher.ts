import { BaseError } from '../errors/baseError';

export interface RepoDetails {
    name: string;
    stars: number;
    forks: number;
    sizeInKB: number;
    numberOfFiles: number;
    visibility: string;
    owner: string;
    webhooks: {
        id: number;
        url: string;
        events: string[];
        active: boolean;
    }[];
    yamlFile?: {
        name: string;
        content: string;
    };
}

interface GitHubTreeItem {
    path: string;
    type: 'blob' | 'tree';
    sha: string;
    url: string;
}

interface GitHubHook {
    id: number;
    config: {
        url: string;
    };
    events: string[];
    active: boolean;
}

export class GitHubFetcherError extends BaseError {
    constructor(message: string) {
        super('bla', 404, message);
        this.name = 'GitHubFetcherError';
    }
}

class GitHubFetcher {
    private baseUrl = 'https://api.github.com/repos/';
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async fetchFileContent(repoName: string, fileSha: string): Promise<string> {
        const response = await fetch(`https://api.github.com/repos/${repoName}/git/blobs/${fileSha}`, {
            headers: {
                'Authorization': `token ${this.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'github-scanner'
            }
        });

        if (!response.ok) {
            throw new GitHubFetcherError(`Failed to fetch file content: ${response.statusText}`);
        }

        const data = await response.json();
        return Buffer.from(data.content, 'base64').toString();
    }

    async fetchRepoDetails(repoName: string): Promise<RepoDetails> {
        try {
            const response = await fetch(this.baseUrl + repoName, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'github-scanner'
                }
            });

            if (!response.ok) {
                throw new GitHubFetcherError(`Failed to fetch repo details: ${response.statusText}`);
            }

            const data = await response.json();
            const defaultBranch = data.default_branch;

            // Get latest commit SHA of the default branch
            const commitRes = await fetch(`https://api.github.com/repos/${repoName}/commits/${defaultBranch}`, {
                headers: { 'User-Agent': 'github-scanner' },
            });

            const commitData = await commitRes.json();
            const treeSha = commitData.commit.tree.sha;
            console.log(treeSha);


            // Fetch the full tree recursively
            const treeRes = await fetch(`https://api.github.com/repos/${repoName}/git/trees/${treeSha}?recursive=1`, {
                headers: { 'User-Agent': 'github-scanner' },
            });
            const treeData = await treeRes.json();
            const fileCount = treeData.tree.filter((item: GitHubTreeItem) => item.type === 'blob').length;

            // Find first YAML file
            const firstYamlFile = treeData.tree.find((item: GitHubTreeItem) =>
                item.type === 'blob' && item.path.endsWith('.yml')
            );

            // Fetch content for the YAML file if found
            const yamlContent = firstYamlFile ? {
                name: firstYamlFile.path,
                content: await this.fetchFileContent(repoName, firstYamlFile.sha)
            } : undefined;

            const url = `https://api.github.com/repos/${repoName}/hooks`;

            const responseHooks = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'github-webhook-scanner',
                },
            });

            if (!responseHooks.ok) {
                const err = await responseHooks.text();
                throw new Error(`Failed to fetch webhooks: ${responseHooks.status} - ${err}`);
            }

            const hooks = await responseHooks.json();

            const activeHooks = hooks.filter((hook: GitHubHook) => hook.active);

            return {
                name: data.name,
                stars: data.stargazers_count,
                forks: data.forks_count,
                sizeInKB: data.size,
                numberOfFiles: fileCount,
                visibility: data.visibility,
                owner: data.owner.login,
                webhooks: activeHooks.map((hook: GitHubHook) => ({
                    id: hook.id,
                    url: hook.config.url,
                    events: hook.events,
                    active: hook.active,
                })),
                yamlFile: yamlContent
            };
        } catch (error) {
            if (error instanceof GitHubFetcherError) {
                throw error;
            }
            const errorMessage = (error instanceof Error) ? error.message : String(error);
            throw new GitHubFetcherError(`Error fetching repo details: ${errorMessage}`);
        }
    }
}

// Create and export a singleton instance
export const githubFetcher = new GitHubFetcher(process.env.GITHUB_TOKEN || ''); 