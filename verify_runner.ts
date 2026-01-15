
import { CodeExecutorService } from './backend/src/services/execution/CodeExecutorService';
import fs from 'fs';
import path from 'path';

async function verifyExecution() {
    const service = new CodeExecutorService();
    const scriptPath = path.join(process.cwd(), 'your_test_script.py');
    const content = fs.readFileSync(scriptPath, 'utf-8');

    console.log("Triggering Python Execution...");
    const result = await service.executeCode(content, 'python');

    console.log("Execution Result:", result);
}

verifyExecution().catch(console.error);
