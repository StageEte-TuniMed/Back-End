const scanner = require("sonarqube-scanner");

scanner(
  {
    serverUrl: process.env.SONAR_HOST_URL || "http://localhost:9000",
    token: process.env.SONAR_TOKEN,
    options: {
      "sonar.projectKey": "tunimed-backend",
      "sonar.projectName": "TuniMed Backend API",
      "sonar.projectVersion": "1.0.0",
      "sonar.sources": "src",
      "sonar.tests": "src/test",
      "sonar.inclusions": "**/*.js",
      "sonar.test.inclusions": "**/*.test.js,**/*.spec.js",
      "sonar.javascript.lcov.reportPaths": "coverage/lcov.info",
      "sonar.exclusions":
        "**/node_modules/**,**/coverage/**,**/dist/**,**/build/**",
      "sonar.coverage.exclusions": "**/test/**,**/*.test.js,**/*.spec.js",
      "sonar.sourceEncoding": "UTF-8",
      "sonar.javascript.environments": "node",
    },
  },
  () => process.exit()
);
