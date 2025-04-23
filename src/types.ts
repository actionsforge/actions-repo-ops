export interface RepoOperationOptions {
  repositoryName: string;
  description?: string;
  isPrivate?: boolean;
  autoInit?: boolean;
  gitignoreTemplate?: string;
  licenseTemplate?: string;
}

export interface RepoUpdateOptions {
  repositoryName: string;
  description?: string;
  homepage?: string;
  private?: boolean;
  hasIssues?: boolean;
  hasProjects?: boolean;
  hasWiki?: boolean;
  hasDiscussions?: boolean;
  defaultBranch?: string;
}

export interface RepoOperationResult {
  status: 'success' | 'failure';
  message: string;
  repositoryUrl?: string;
}

export interface GitHubClient {
  createRepository(options: RepoOperationOptions): Promise<RepoOperationResult>;
  deleteRepository(name: string): Promise<RepoOperationResult>;
  archiveRepository(name: string): Promise<RepoOperationResult>;
  updateRepository(options: RepoUpdateOptions): Promise<RepoOperationResult>;
}
