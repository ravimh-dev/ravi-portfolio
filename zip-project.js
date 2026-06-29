import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const tempDir = './deploy-temp';
const zipFile = 'portfolio-deploy-' + Date.now() + '.zip';

try {

  // 2. Build the production assets
  console.log('📦 Running production build...');
  execSync('npm run build', { stdio: 'inherit' });

  // 3. Create temp directory
  fs.mkdirSync(tempDir);

  // 4. Copy required runtime files to temp directory
  const itemsToCopy = [
    'dist',
    'server.ts',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    '.env.local' // Exclude if they configure server env separately, but good for quick starts
  ];

  console.log('📂 Copying files to deploy-temp...');
  itemsToCopy.forEach(item => {
    if (fs.existsSync(item)) {
      const destPath = path.join(tempDir, item);
      const stat = fs.statSync(item);
      if (stat.isDirectory()) {
        fs.cpSync(item, destPath, { recursive: true });
      } else {
        fs.copyFileSync(item, destPath);
      }
    }
  });

  // 5. Compress the temp folder
  console.log('⚡ Generating deployment zip archive...');
  if (process.platform === 'win32') {
    // Windows PowerShell
    execSync(`powershell -Command "Compress-Archive -Path '${tempDir}/*' -DestinationPath '${zipFile}' -Force"`);
  } else {
    // Linux/macOS zip
    execSync(`cd ${tempDir} && zip -r ../${zipFile} ./*`);
  }

  console.log(`✅ Success! Created deployment package: ${zipFile}`);
} catch (error) {
  console.error('❌ Error during packaging:', error);
} finally {
  // 6. Clean up temporary files
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
}
