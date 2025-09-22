const fs = require('fs');
const path = require('path');

console.log('🔍 Running security checks...\n');

// Check 1: Ensure no service role keys in client code
function checkForServiceRoleKeys() {
  console.log('1️⃣ Checking for exposed service role keys...');
  
  const clientDirs = ['src', 'public'];
  const dangerousPatterns = [
    /service_role/gi,
    /supabase.*service.*key/gi,
    /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g // JWT pattern
  ];

  let violations = [];

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (file.isFile() && /\.(ts|tsx|js|jsx|html|css)$/.test(file.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        dangerousPatterns.forEach((pattern, index) => {
          const matches = content.match(pattern);
          if (matches) {
            violations.push({
              file: fullPath,
              pattern: index,
              matches: matches.slice(0, 3) // Limit to first 3 matches
            });
          }
        });
      }
    }
  }

  clientDirs.forEach(scanDirectory);

  if (violations.length > 0) {
    console.error('❌ Security violations found:');
    violations.forEach(violation => {
      console.error(`   File: ${violation.file}`);
      console.error(`   Matches: ${violation.matches.join(', ')}`);
    });
    process.exit(1);
  }

  console.log('✅ No service role keys found in client code');
}

// Check 2: Validate environment variable usage
function checkEnvironmentVariables() {
  console.log('2️⃣ Checking environment variable usage...');
  
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const requiredVars = envExample
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => line.split('=')[0]);

  const missingVars = requiredVars.filter(varName => {
    if (varName.startsWith('VITE_')) {
      return !process.env[varName];
    }
    return false; // Server vars are checked separately
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   ${varName}`);
    });
    process.exit(1);
  }

  console.log('✅ Environment variables properly configured');
}

// Check 3: Validate build output
function checkBuildSecurity() {
  console.log('3️⃣ Checking build security...');
  
  const distPath = 'dist';
  if (!fs.existsSync(distPath)) {
    console.log('⚠️ Build directory not found, skipping build security check');
    return;
  }

  // Check for any service role keys in built files
  function scanBuildFiles(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        scanBuildFiles(fullPath);
      } else if (file.isFile() && /\.(js|css|html)$/.test(file.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        if (content.includes('service_role') || content.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
          console.error(`❌ Potential secret found in build file: ${fullPath}`);
          process.exit(1);
        }
      }
    }
  }

  scanBuildFiles(distPath);
  console.log('✅ Build output is secure');
}

// Check 4: Validate package dependencies
function checkDependencies() {
  console.log('4️⃣ Checking dependency security...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  // Check for known vulnerable packages (basic check)
  const knownVulnerable = ['lodash@4.17.20', 'moment@2.29.1'];
  const installedVulnerable = Object.entries(dependencies).filter(([name, version]) => {
    return knownVulnerable.some(vuln => vuln.startsWith(name + '@'));
  });

  if (installedVulnerable.length > 0) {
    console.error('❌ Known vulnerable dependencies found:');
    installedVulnerable.forEach(([name, version]) => {
      console.error(`   ${name}@${version}`);
    });
    process.exit(1);
  }

  console.log('✅ No known vulnerable dependencies found');
}

// Run all security checks
async function runSecurityChecks() {
  try {
    checkForServiceRoleKeys();
    checkEnvironmentVariables();
    checkBuildSecurity();
    checkDependencies();
    
    console.log('\n🎉 All security checks passed!');
    console.log('🔒 Application is ready for deployment');
  } catch (error) {
    console.error('\n💥 Security check failed:', error.message);
    process.exit(1);
  }
}

runSecurityChecks();