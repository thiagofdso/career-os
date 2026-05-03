const scanner = require('sonarqube-scanner').default;
scanner({
  serverUrl: 'http://127.0.0.1:9000',
  options: {
    'sonar.projectKey': 'career-os',
    'sonar.projectName': 'career-os',
    'sonar.sources': 'backend/src,frontend/src,mcp-server/src',
    'sonar.tests': 'backend/test,frontend/test,mcp-server/test,e2e',
    'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    'sonar.login': 'admin',
    'sonar.password': 'admin'
  }
}, () => process.exit());
