// src/scripts/generate-report.ts

import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-provider-env";
import { Command } from "commander";

const command = new ListBucketsCommand({});

async function createS3Client() {
  try {
    return new S3Client({
      credentials: fromEnv(),
    });
  } catch (error: any) {
    if (error.message.includes('No SSO sessions found') ||
        error.message.includes('SSO session associated with this profile has expired')) {
      console.error('\nError: AWS SSO session is expired or not found');
      console.error('Please run "aws sso login" and try again\n');
    } else {
      console.error('\nError: Failed to create IAM client with your current aws profile');
      console.error(`Details: ${error.message}\n`);
    }
    throw error;
  }
}

const program = new Command();
program
  .name('list-buckets')
  .description('Lists all buckets in the current account')
  .parse(process.argv);

(async () => {
  const client = await createS3Client();
  const response = await client.send(command);
  console.log(response);
})();
