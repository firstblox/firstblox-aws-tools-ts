import { typescript } from 'projen';
import { NodePackageManager, UpgradeDependenciesSchedule } from 'projen/lib/javascript';

const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: '@firstblox/firstblox-aws-tools-ts',
  projenrcTs: true,
  jest: false,
  devDeps: [
    '@types/cli-progress',
    'tsx',
  ],
  deps: [
    '@aws-sdk/client-iam',
    '@aws-sdk/client-rds',
    '@aws-sdk/client-s3',
    '@aws-sdk/credential-provider-env',
    'cli-progress',
    'commander',
    'inquirer',
  ],
  release: true,
  releaseToNpm: true,
  npmRegistryUrl: 'https://npm.pkg.github.com',
  packageManager: NodePackageManager.PNPM,
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.MONTHLY,
    },
  },
});

project.npmrc.addConfig('@firstblox:registry', 'https://npm.pkg.github.com/');
project.npmrc.addConfig('//npm.pkg.github.com/:_authToken', '${NPM_TOKEN}');

project.github?.mergify?.addRule({
  name: 'Auto-merge Projen upgrade PRs',
  conditions: [
    'author=github-actions[bot]',
    'title~^chore\\(deps\\): upgrade dependencies',
    'label=auto-approve',
    'check-success=build',
  ],
  actions: {
    review: {
      type: 'APPROVE',
    },
    merge: {
      method: 'squash',
    },
  },
});

project.addBins({
  'create-share-rds-snapshot': 'tsx ./src/bin/create-share-rds-snapshot.ts',
});

project.addScripts({
  'create-share-rds-snapshot': 'node ./lib/bin/create-share-rds-snapshot.js',
});

project.synth();