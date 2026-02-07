module.exports = {
  apps: [
    {
      name: "avi-back",
      script: "node dist/main.js --env-file .env",
      watch: false
    }
  ]
}
