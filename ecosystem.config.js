module.exports = {
  apps: [
    {
      name: 'shadow-frontend',
      cwd: './apps/frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 4343
      }
    },
    {
      name: 'shadow-server',
      cwd: './apps/server',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'development',
        AGENT_MODE: 'local',
        PORT: 4000
      }
    }
  ]
};
