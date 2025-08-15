# SonarQube Authentication Setup Guide

## Current Issue
The SonarQube analysis is failing with authentication error:
```
ERROR: Not authorized. Please check the user token in the property 'sonar.token' or 'sonar.login' (deprecated).
```

## Solutions

### Option 1: Generate and Configure SonarQube Token (Recommended)

#### Step 1: Generate SonarQube Token
1. Open SonarQube dashboard: `http://172.17.0.1:9000`
2. Login with admin credentials (default: admin/admin)
3. Go to **My Account** → **Security** → **Generate Tokens**
4. Create a new token:
   - Name: `jenkins-tunimed-backend`
   - Type: `User Token` or `Project Analysis Token`
   - Expiration: Set as needed
5. Copy the generated token

#### Step 2: Configure Jenkins Environment Variable
1. Go to **Jenkins Dashboard** → **Manage Jenkins** → **System Configuration**
2. Add Environment Variable:
   - Name: `SONAR_TOKEN`
   - Value: `your_generated_token_here`

**OR** for pipeline-specific configuration:
1. Go to your pipeline configuration
2. Add Environment Variable in pipeline settings:
   - Name: `SONAR_TOKEN`
   - Value: `your_generated_token_here`

#### Step 3: Alternative - Jenkins Credentials
1. Go to **Jenkins Dashboard** → **Manage Jenkins** → **Credentials**
2. Add new **Secret Text** credential:
   - ID: `sonar-token`
   - Secret: `your_generated_token_here`
   - Description: `SonarQube Token for TuniMed Backend`

### Option 2: Disable Authentication (For Development Only)

If this is a development environment and you want to disable authentication:

1. Open SonarQube: `http://172.17.0.1:9000`
2. Login as admin
3. Go to **Administration** → **Security** → **General**
4. Disable **Force user authentication**
5. Save changes

### Option 3: Use Default Credentials

For basic setup, you can use default SonarQube credentials:
- Username: `admin`
- Password: `admin` (or whatever you set during first login)

## Environment Variables the Script Supports

The script automatically checks for these environment variables (in order):
1. `SONAR_TOKEN` - Modern token-based authentication
2. `SONAR_AUTH_TOKEN` - Legacy Jenkins plugin variable
3. `SONAR_LOGIN` - Basic login authentication

## Testing the Setup

### Local Test (if you have sonar-scanner installed)
```bash
# Test with token
export SONAR_TOKEN="your_token_here"
./sonar-analysis-standalone.sh

# Test with login
export SONAR_LOGIN="admin"
./sonar-analysis-standalone.sh
```

### Jenkins Test
After setting up the environment variable, trigger a new build and check the logs for:
```
🔑 Using SONAR_TOKEN for authentication
```

## Troubleshooting

### 1. Check SonarQube Access
```bash
curl -u admin:admin http://172.17.0.1:9000/api/system/status
```

### 2. Verify Token
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://172.17.0.1:9000/api/system/status
```

### 3. Check Jenkins Environment
In Jenkins pipeline, add this debug step:
```groovy
sh 'echo "SONAR_TOKEN: ${SONAR_TOKEN}"'
```

## Security Best Practices

1. **Use tokens instead of passwords**
2. **Set appropriate token expiration**
3. **Use Jenkins credentials store instead of plain text**
4. **Restrict token permissions to minimum required**
5. **Rotate tokens regularly**

## Current Pipeline Status

✅ SonarQube URL detection working (`http://172.17.0.1:9000`)
✅ sonar-scanner installation working
✅ Test coverage generation working
❌ Authentication required

Next step: Set up SONAR_TOKEN environment variable in Jenkins.
