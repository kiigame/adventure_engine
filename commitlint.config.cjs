module.exports = {
  extends: [
    "@commitlint/config-conventional"
  ],
  plugins: ['commitlint-plugin-tense'],
  rules: {
    'tense/subject-tense': [
      1,
      'always',
      {
        allowedTenses: ['present-imperative'],
        firstOnly: true,
        allowlist: [],
      }
    ]
  }
}
