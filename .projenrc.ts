import { typescript } from 'projen';

const project = new typescript.TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: 'firstblox-aws-tools-ts',
  projenrcTs: true,
  devDeps: ["tsx"],
  deps: [
    '@aws-sdk/client-iam',
    "@aws-sdk/client-s3",
    '@aws-sdk/credential-provider-env',
    'commander',
  ],
});

project.addScripts({
  "list-buckets": "tsx ./src/lib/scripts/list-buckets.ts",
});

project.synth();