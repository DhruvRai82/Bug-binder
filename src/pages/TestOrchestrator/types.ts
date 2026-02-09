/**
 * Module: TestOrchestrator Types
 * Purpose: Centralized type definitions for the orchestrator module
 * Why: Avoids import cycles and provides single source of truth for types
 */

export interface FileNode {
    id: string;
    name: string;
    path?: string; // Optional to match IDE types
    type: 'file' | 'folder';
    children?: FileNode[];
    extension?: string;
}

export interface TestSuite {
    id: string;
    name: string;
    description?: string;
    fileIds: string[];
    createdAt: string;
    updatedAt: string;
    projectId: string;
}

export interface TestRun {
    id: string;
    projectId: string;
    status: 'running' | 'passed' | 'failed' | 'cancelled';
    startTime: string;
    endTime?: string;
    duration?: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: TestResult[];
    config: RunConfig;
}

export interface TestResult {
    testName: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    screenshot?: string;
}

export interface RunConfig {
    environment: 'local' | 'staging' | 'prod';
    browser: 'chrome' | 'firefox' | 'edge';
    headless: boolean;
    parallel: number;
}
