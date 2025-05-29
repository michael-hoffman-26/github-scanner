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

class GitHubFetcher {
    private readonly baseUrl = 'https://api.github.com/repos/';
    private readonly token: string;
    private readonly headers: HeadersInit;

    constructor(token: string) {
        this.token = token;
        this.headers = {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'github-scanner'
        };
    }

    private async fetchFromGitHub<T>(url: string): Promise<T> {
        const response = await fetch(url, { headers: this.headers });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`GitHub API request failed: ${response.status} - ${errorText}`);
        }

        return response.json();
    }

    private async fetchFileContent(repoName: string, fileSha: string): Promise<string> {
        const data = await this.fetchFromGitHub<{ content: string }>(
            `${this.baseUrl}${repoName}/git/blobs/${fileSha}`
        );
        return Buffer.from(data.content, 'base64').toString();
    }

    private async fetchWebhooks(repoName: string): Promise<GitHubHook[]> {
        const hooks = await this.fetchFromGitHub<GitHubHook[]>(
            `${this.baseUrl}${repoName}/hooks`
        );
        return hooks.filter(hook => hook.active);
    }

    private async fetchRepoTree(repoName: string, treeSha: string): Promise<GitHubTreeItem[]> {
        const treeData = await this.fetchFromGitHub<{ tree: GitHubTreeItem[] }>(
            `${this.baseUrl}${repoName}/git/trees/${treeSha}?recursive=1`
        );
        return treeData.tree;
    }

    async fetchRepoDetails(repoName: string): Promise<RepoDetails> {
        try {
            // Fetch basic repo information
            const repoData = await this.fetchFromGitHub<any>(`${this.baseUrl}${repoName}`);
            const defaultBranch = repoData.default_branch;

            // Get latest commit SHA
            const commitData = await this.fetchFromGitHub<any>(
                `${this.baseUrl}${repoName}/commits/${defaultBranch}`
            );
            const treeSha = commitData.commit?.tree?.sha;

            // Fetch repository tree
            const treeItems = await this.fetchRepoTree(repoName, treeSha);
            const fileCount = treeItems.filter(item => item.type === 'blob').length;

            // Find and fetch YAML file
            const firstYamlFile = treeItems.find(item =>
                item.type === 'blob' && item.path.endsWith('.yml')
            );
            const yamlContent = firstYamlFile ? {
                name: firstYamlFile.path,
                content: await this.fetchFileContent(repoName, firstYamlFile.sha)
            } : undefined;

            // Fetch webhooks
            const activeHooks = await this.fetchWebhooks(repoName);

            return {
                name: repoData.name,
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                sizeInKB: repoData.size,
                numberOfFiles: fileCount,
                visibility: repoData.visibility,
                owner: repoData.owner.login,
                webhooks: activeHooks.map(hook => ({
                    id: hook.id,
                    url: hook.config.url,
                    events: hook.events,
                    active: hook.active,
                })),
                yamlFile: yamlContent
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching repo details: ${errorMessage}`);
        }
    }
}

// Create and export a singleton instance
export const githubFetcher = new GitHubFetcher(process.env.GITHUB_TOKEN || ''); 