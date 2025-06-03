import { typescript } from 'projen';
import { NodePackageManager, UpgradeDependenciesSchedule } from 'projen/lib/javascript';

const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'firstblox-aws-tools-ts',
  projenrcTs: true,
  devDeps: [
    "@types/cli-progress",
    "tsx"
  ],
  deps: [
    '@aws-sdk/client-iam',
    '@aws-sdk/client-rds',
    "@aws-sdk/client-s3",
    '@aws-sdk/credential-provider-env',
    'cli-progress',
    'commander',
    'inquirer',
  ],
  packageManager: NodePackageManager.PNPM,
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.MONTHLY,
    },
  },
});

project.addScripts({
  "list-buckets": "tsx ./src/lib/scripts/list-buckets.ts",
  "create-rds-snapshot": "tsx ./src/lib/scripts/create-share-rds-snapshot.ts",
});

project.synth();