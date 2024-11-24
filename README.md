# Tauri-Solid

使用`Tauri`开发的桌面应用，前端使用`Solid.js`+`Typescript`、后端使用`Rust`。

## 使用

- 克隆项目

```shell
git clone
cd tauri-solid
```

- 安装依赖

```shell
npm install
```

- 开发

```shell
npm run tauri-dev
```

- 打包

```shell
npm run tauri-build
```

## 开发

## 模板构建过程

1. 创建`Solid`项目

- 使用`rsbuild`创建项目

  ```shell
  npm create rsbuild@latest
  ```

- 设置项目名称(`.`表示当前目录为项目名称)、选择`Solid`模板、选择`Typescript`、选
  择`Prettier`

2. 创建`Tauri`项目

- 安装脚手架
  ```shell
  npm i @tauri-apps/cli -D
  ```
- 安装`@tauri-apps/api`依赖，提供`rust`交互和`Native`操作
  ```shell
  npm i @tauri-apps/api
  ```
- 添加脚本，修改`package.json`
  ```json
  "scripts": {
    "tauri-init": "tauri init",
    "tauri-dev": "tauri dev",
    "tauri-build": "tauri build",
  }
  ```
- 初始化项目，确保`tauri init`可执行
  ```shell
  npm run tauri-init
  ```
- 设置项目名称、设置标题、设置前端打包目录、设置前端服务URL、设置前端开发命令、
  设置前端打包命令

3. 初始化设置和初始化客户端设计

- 禁用默认标题栏，设置`src-tauri/tauri.conf.json`
  ```json
  {
    "app": {
      "windows": [
        {
          "decorations": false
        }
      ]
    }
  }
  ```
- 添加拖动、最大化、最小化等权限，设置`src-tauri/capabilities/default.json`
  ```json
  {
    "permissions": [
      "core:window:allow-minimize",
      "core:window:allow-maximize",
      "core:window:allow-unmaximize",
      "core:window:allow-close",
      "core:window:allow-start-dragging",
      "core:window:allow-toggle-maximize"
    ]
  }
  ```
- 配置路径别名，设置`tsconfig.json`
  ```json
  "paths": {
    "@*": ["./src/*"]
  }
  ```
- 根元素添加样式类，设置`src/index.tsx`

  ```tsx
  import { render } from 'solid-js/web';
  import App from '@/App';

  const root = document.getElementById('root');
  if (root) {
    root.classList.add('uxy-tauri-solid-app');
    render(() => <App />, root);
  }
  ```

- 初始化客户端，设置`src/App.tsx`
