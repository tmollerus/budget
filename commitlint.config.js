module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'subject-case': [2, 'always', ['lower-case', 'sentence-case', 'camel-case', 'pascal-case', 'start-case']],
    'type-enum': [
      2,
      'always',
      [
        'breaking',
        'build',
        'ci',
        'chore',
        'docs',
        'feat',
        'fix',
        'new',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
        'update',
        'upgrade',
      ],
    ],
  },
};