// How pm2 runs OdyFeed on the Pi.
// The settings (base URL, port, OpenAI key) come from ~/.config/odyfeed.env, outside the
// repository, so nothing secret is ever committed.
const home = require('node:os').homedir()

module.exports = {
  apps: [
    {
      name: 'odyfeed',
      // the server keeps its data in ./data and its logs in ./logs, relative to this folder
      cwd: `${home}/odyfeed`,
      script: '.output/server/index.mjs',
      interpreter: 'node',
      node_args: `--env-file=${home}/.config/odyfeed.env`,
      env: { NODE_ENV: 'production' },
    },
  ],
}
