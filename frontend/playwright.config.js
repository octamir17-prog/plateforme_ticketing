module.exports = {
  timeout: 30000,
  use: {
    headless: true,
    browserName: 'chromium',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};