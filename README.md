# fe-repo-cli
一款用于构建 Web 各类型项目模板的cli工具，支持的模版类型有：h5项目，admin管理后台项目，node-web项目，小程序项目。

## 安装
npm install -g fe-repo-cli

## 使用
fe-repo-cli create

### 查看可用命令
fe-repo-cli -h

### 查看可构建的项目
fe-repo-cli list / fe-repo-cli ls

### 强制创建
fe-repo-cli create -f

## 本地运行
node ./bin/cli.js create

## npm包调试
npm link  
fe-repo-cli create