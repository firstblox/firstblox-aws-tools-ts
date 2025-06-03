import {
  RDSClient,
  CreateDBSnapshotCommand,
  DescribeDBInstancesCommand,
  ModifyDBSnapshotAttributeCommand,
  DescribeDBSnapshotsCommand,
} from "@aws-sdk/client-rds";
import { fromEnv } from "@aws-sdk/credential-provider-env";
import { Command } from "commander";
import cliProgress from "cli-progress";
import inquirer from "inquirer";

const program = new Command();
program
  .name('create-rds-snapshot')
  .description('Create an RDS snapshot in a target region and share it with a specific AWS account')
  .option('--region <region>', 'Target AWS region')
  .option('--db-identifier <id>', 'RDS database identifier')
  .option('--share-account <account>', 'AWS Account ID to share the snapshot with')
  .option('--dry-run', 'Show what would be done without making changes')
  .parse(process.argv);

const options = program.opts();

async function promptForMissingOptions(opts: any) {
  const questions = [];
  if (!opts.region) {
    questions.push({ type: "input", name: "region", message: "Enter AWS region:" });
  }
  if (!opts.dbIdentifier) {
    questions.push({ type: "input", name: "dbIdentifier", message: "Enter RDS database identifier:" });
  }
  if (!opts.shareAccount) {
    questions.push({ type: "input", name: "shareAccount", message: "Enter AWS Account ID to share with:" });
  }
  if (typeof opts.dryRun === 'undefined') {
    questions.push({
      type: "confirm",
      name: "dryRun",
      message: "Dry run? (Type 'yes' for dry run, 'no' to execute the operation)",
      default: false
    });
  }
  if (questions.length > 0) {
    const answers = await inquirer.prompt(questions as any);
    return { ...opts, ...answers };
  }
  return opts;
}

async function createRdsClient(region: string) {
  return new RDSClient({
    region,
    credentials: fromEnv(),
  });
}

async function main(options: any) {
  const { region, dbIdentifier, shareAccount, dryRun } = {
    region: options.region,
    dbIdentifier: options.dbIdentifier,
    shareAccount: options.shareAccount,
    dryRun: !!options.dryRun,
  };

  const client = await createRdsClient(region);

  // Get instance info
  const describeCmd = new DescribeDBInstancesCommand({ DBInstanceIdentifier: dbIdentifier });
  const instanceData = await client.send(describeCmd);
  const instance = instanceData.DBInstances?.[0];

  if (!instance) {
    console.error("❌ Could not find RDS database:", dbIdentifier);
    process.exit(1);
  }

  const snapshotId = `${dbIdentifier}-snapshot-${Date.now()}`;

  if (dryRun) {
    console.log("📝 [Dry Run] Would create snapshot for:");
    console.log(`   📦 Database: ${dbIdentifier}`);
    console.log(`   🌎 Region:   ${region}`);
    console.log(`   👤 Share with Account: ${shareAccount}`);
    console.log(`   🏷️ Snapshot ID: ${snapshotId}`);
    return;
  }

  console.log(`🚀 Creating snapshot "${snapshotId}" for database "${dbIdentifier}" in region "${region}"...`);

  const progressBar = new cliProgress.SingleBar({
    format: 'Progress |{bar}| {percentage}% | {status}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(100, 0, { status: 'Starting...' });

  // Create snapshot
  await client.send(new CreateDBSnapshotCommand({
    DBInstanceIdentifier: dbIdentifier,
    DBSnapshotIdentifier: snapshotId,
  }));

  // Wait for snapshot to be available
  let percent = 10;
  let available = false;
  while (!available) {
    await new Promise(res => setTimeout(res, 60000));
    percent = Math.min(percent + 10, 90);
    progressBar.update(percent, { status: 'Waiting for snapshot...' });

    const snapResp = await client.send(new DescribeDBSnapshotsCommand({
      DBSnapshotIdentifier: snapshotId,
    }));
    const snap = snapResp.DBSnapshots?.[0];
    if (snap?.Status === "available") {
      available = true;
      progressBar.update(100, { status: 'Snapshot available!' });
    }
  }

  // Share snapshot
  progressBar.update(100, { status: 'Sharing snapshot...' });
  await client.send(new ModifyDBSnapshotAttributeCommand({
    DBSnapshotIdentifier: snapshotId,
    AttributeName: "restore",
    ValuesToAdd: [shareAccount],
  }));

  progressBar.stop();
  console.log(`✅ Snapshot "${snapshotId}" created and shared with account ${shareAccount} 🎉`);
}

(async () => {
  const filledOptions = await promptForMissingOptions(options);
  await main(filledOptions);
})();
