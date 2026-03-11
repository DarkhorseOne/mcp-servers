# 发布到 MCP Registry（uk-parliament-commonsvotes）操作步骤文档（仅计划，不执行）

> 目的：依据 `docs/publish-to-mcp-registry-guide.md`，制定 **@darkhorseone/mcp-server-uk-parliament-commonsvotes** 发布到官方 MCP Registry 的完整行动计划。
> 注意：**本文件仅列出步骤，不执行任何实际发布准备动作或发布操作**。

---

## 0. 发布对象与命名

- 目标包：`@darkhorseone/mcp-server-uk-parliament-commonsvotes`
- MCP Registry 名称（mcpName）：`io.github.nick-ma/uk-parliament-commonsvotes`
  - 说明：使用 GitHub 登录时，`mcpName` **必须** 以 `io.github.nick-ma/` 开头。
- 版本：与 npm 已发布版本保持一致（当前本仓库包版本为 `1.0.0`）。

---

## 1. 前置条件检查（不执行）

1. 确认具备：
   - Node.js
   - npm 账户（用于 npm 包发布）
   - GitHub 账户（用于 MCP Registry 登录）
2. 确认包已 **先发布到 npm**（MCP Registry 只保存元数据）。

---

## 2. package.json 验证信息（不执行）

> MCP Registry 要求 npm 包包含 `mcpName` 字段。

1. 在 `servers/uk-parliament-commonsvotes/package.json` 增加：
   ```json
   {
     "mcpName": "io.github.nick-ma/uk-parliament-commonsvotes"
   }
   ```
2. 保证 `mcpName` 与后续 `server.json` 的 `name` 完全一致。

---

## 3. npm 发布（不执行）

> MCP Registry 仅托管元数据，必须先确保 npm 发布完成。

1. 安装依赖
   ```bash
   pnpm install
   ```
2. 构建分发文件
   ```bash
   pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run build
   ```
3. npm 登录（如需要）
   ```bash
   npm adduser
   ```
4. 发布到 npm
   ```bash
   pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes publish --access public
   ```
5. 验证 npm 包已发布（浏览器访问 npm 包页）。

---

## 4. 安装 mcp-publisher（不执行）

1. 使用二进制或 Homebrew 安装：
   ```bash
   brew install mcp-publisher
   ```
2. 验证安装
   ```bash
   mcp-publisher --help
   ```

---

## 5. 创建 server.json（不执行）

> 在包目录下生成模板并手动编辑。

1. 进入包目录
   ```bash
   cd servers/uk-parliament-commonsvotes
   ```
2. 生成模板
   ```bash
   mcp-publisher init
   ```
3. 编辑 `server.json`（示例结构）
   ```json
   {
     "$schema": "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
     "name": "io.github.nick-ma/uk-parliament-commonsvotes",
     "description": "MCP server for UK Parliament Commons Votes API",
     "repository": {
       "url": "https://github.com/DarkhorseOne/mcp-servers",
       "source": "github"
     },
     "version": "1.0.0",
     "packages": [
       {
         "registryType": "npm",
         "identifier": "@darkhorseone/mcp-server-uk-parliament-commonsvotes",
         "version": "1.0.0",
         "transport": {
           "type": "stdio"
         }
       }
     ]
   }
   ```
4. 关键校验：
   - `name` == `package.json#(mcpName)`
   - `packages[0].identifier` == npm 包名
   - `packages[0].version` == npm 已发布版本

---

## 6. MCP Registry 登录（不执行）

1. GitHub 登录：
   ```bash
   mcp-publisher login github
   ```
2. 按终端提示完成设备授权流程。

---

## 7. 发布到 MCP Registry（不执行）

1. 发布命令：
   ```bash
   mcp-publisher publish
   ```
2. 预期输出：
   - “Successfully published”
   - 显示服务器名称与版本

---

## 8. 发布验证（不执行）

使用 Registry API 搜索：

```bash
curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.nick-ma/uk-parliament-commonsvotes"
```

预期在返回 JSON 中包含该服务条目。

---

## 9. 常见问题（不执行）

- **Registry validation failed for package**
  - 检查 `package.json` 是否包含正确的 `mcpName`。
- **Invalid or expired Registry JWT token**
  - 重新执行 `mcp-publisher login github`。
- **You do not have permission to publish this server**
  - `mcpName` 必须以 `io.github.nick-ma/` 开头。

---

## 10. 执行清单（复查）

- [ ] npm 包已发布且版本正确
- [ ] `package.json` 添加 `mcpName`
- [ ] `server.json` 已生成并校验字段一致性
- [ ] `mcp-publisher` 已安装
- [ ] 已通过 GitHub 登录
- [ ] 已执行 `mcp-publisher publish`
- [ ] Registry API 校验可检索到
