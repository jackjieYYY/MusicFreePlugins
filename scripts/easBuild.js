const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runTscCommand(args) {
  return new Promise((resolve, reject) => {
    const tsc = spawn('tsc', args, { stdio: 'inherit' });
    
    tsc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`tsc exited with code ${code}`));
      }
    });
    
    tsc.on('error', (error) => {
      reject(error);
    });
  });
}

async function buildAllPlugins() {
  const pluginsDir = './plugins';

  // 检查 plugins 目录是否存在
  if (!fs.existsSync(pluginsDir)) {
    console.log('❌ plugins 目录不存在');
    return;
  }

  // 读取 plugins 目录下的所有子文件夹
  const pluginFolders = fs.readdirSync(pluginsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log('找到插件文件夹:', pluginFolders);

  // 筛选出包含 index.ts 的插件
  const validPlugins = [];
  for (const folder of pluginFolders) {
    const indexPath = path.join(pluginsDir, folder, 'index.ts');
    if (fs.existsSync(indexPath)) {
      validPlugins.push({
        name: folder,
        entryPoint: indexPath
      });
    }
  }

  console.log('有效插件:', validPlugins.map(p => p.name));

  if (validPlugins.length === 0) {
    console.log('❌ 未找到任何包含 index.ts 的插件');
    return;
  }

  for (const plugin of validPlugins) {
    const outDir = `./dist/${plugin.name}`;

    // 确保输出目录存在
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    try {
      console.log(`🔨 正在构建 ${plugin.name}...`);
      
      // 使用 tsc 编译单个文件
      await runTscCommand([
        plugin.entryPoint,
        '--noImplicitAny', 'false',
        '--noEmitOnError', 'true',
        '--removeComments', 'true',
        '--allowJs', 'true',
        '--sourceMap', 'false',
        '--module', 'CommonJS',
        '--target', 'ES2017',
        '--outDir', outDir,
        '--baseUrl', './',
        '--esModuleInterop', 'true',
        '--skipLibCheck', 'true'
      ]);

      console.log(`✅ ${plugin.name} 构建完成`);
    } catch (error) {
      console.error(`❌ ${plugin.name} 构建失败:`, error.message);
    }
  }

  console.log('🎉 所有插件构建完成！');
}

buildAllPlugins().catch(error => {
  console.error('构建过程出错:', error);
  process.exit(1);
});