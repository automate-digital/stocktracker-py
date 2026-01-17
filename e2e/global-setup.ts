import { FullConfig } from '@playwright/test';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';

let apiProcess: ReturnType<typeof spawn> | null = null;

function waitForPort(url: string, timeoutMs = 60000): Promise<void> {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const req = http.get(url, res => {
        // any response means server is up
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timeout waiting for ${url}`));
          return;
        }
        setTimeout(check, 500);
      });
    };
    check();
  });
}

async function startApi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env } as NodeJS.ProcessEnv;
    // Force test-friendly environment for consistency
    env.ALPHAVANTAGE_APIKEY = 'DUMMY-KEY-FOR-TESTS';
    env.DATA_STORE_FILENAME = 'e2e-port.csv';
    env.DISABLE_TICKER_VALIDATION = '1';
    env.MOCK_PRICES = '1';

    // Prefer project virtualenv Python if available
    const venvPython = path.resolve(process.cwd(), 'venv', 'bin', 'python');
    const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';

    apiProcess = spawn(pythonCmd, ['api.py'], {
      cwd: process.cwd(),
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderrBuf = '';
    apiProcess.stderr?.on('data', (d) => { stderrBuf += d.toString(); });

    apiProcess.on('exit', (code) => {
      reject(new Error(`API process exited early with code ${code}. Logs: ${stderrBuf}`));
    });

    // Wait for API to respond on 5001
    waitForPort('http://127.0.0.1:5001/portfolio')
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

async function stopApi(): Promise<void> {
  if (apiProcess) {
    try {
      apiProcess.kill('SIGTERM');
    } catch {}
    apiProcess = null;
  }
}

async function globalSetup(config: FullConfig) {
  // Ensure AlphaVantage API key exists for backend validation
  if (!process.env.ALPHAVANTAGE_APIKEY) {
    console.warn('Warning: ALPHAVANTAGE_APIKEY not set. Backend will fail valuation; UI handles failure message.');
  }
  await startApi();
  process.on('exit', () => stopApi());
}

export default globalSetup;
