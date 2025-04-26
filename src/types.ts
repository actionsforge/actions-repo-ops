export interface RepoOperationOptions {
  repositoryName: string;
  description?: string;
  isPrivate?: boolean;
  autoInit?: boolean;
  gitignoreTemplate?: string;
  licenseTemplate?: string;
  homepage?: string;
  hasIssues?: boolean;
  hasProjects?: boolean;
  hasWiki?: boolean;
  hasDiscussions?: boolean;
  teamId?: number;
  allowSquashMerge?: boolean;
  allowMergeCommit?: boolean;
  allowRebaseMerge?: boolean;
  allowAutoMerge?: boolean;
  deleteBranchOnMerge?: boolean;
  allowUpdateBranch?: boolean;
  defaultBranch?: string;
  useSquashPrTitleAsDefault?: boolean;
  squashMergeCommitTitle?: 'PR_TITLE' | 'COMMIT_OR_PR_TITLE';
  squashMergeCommitMessage?: 'PR_BODY' | 'COMMIT_MESSAGES' | 'BLANK';
  mergeCommitTitle?: 'PR_TITLE' | 'MERGE_MESSAGE';
  mergeCommitMessage?: 'PR_BODY' | 'PR_TITLE' | 'BLANK';
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
