module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: 'C:/AGENDA/VR2025/Matratex/frontend',
      script: 'npx',
      args: 'next start -p 3001 -H 0.0.0.0',
      interpreter: 'cmd.exe',
    },
  ],
};
