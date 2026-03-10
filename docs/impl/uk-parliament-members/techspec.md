# UK Parliament Members MCP Server 技术规格（反向修正版）

> 目标：保证在一个全新项目中，**只给本文件 + `swagger.json`**，即可由智能编码代理一次性完成交付（实现 + 测试 +可运行）。

---

## 0. 一口气执行入口（必须按此执行）

### 0.1 输入与变量

```bash
SERVER_SLUG="uk-parliament-members"
PACKAGE_NAME="@darkhorseone/mcp-server-${SERVER_SLUG}"
PACKAGE_DIR="servers/${SERVER_SLUG}"
SWAGGER_PATH="docs/impl/uk-parliament-members/swagger.json"
```

### 0.2 产物文件清单（必须完整）

在 `${PACKAGE_DIR}` 生成并维护以下文件：

- `package.json`
- `tsconfig.json`
- `README.md`
- `src/index.ts`（stdio MCP 入口）
- `src/http.ts`（HTTP proxy 入口）
- `src/core.ts`（参数解析、上游调用、错误映射）
- `src/endpoints.generated.ts`（由 swagger 生成的 endpoint registry）
- `src/tools.generated.ts`（MCP tools 注册与输入 schema 构建）
- `test/endpoints.generated.test.ts`
- `test/tools.generated.test.ts`
- `test/http.proxy.test.ts`

### 0.3 端到端步骤（严格顺序）

1. 读取 `swagger.json`，提取所有 `paths[*].get` endpoints（本例应为 43 个）。
2. 生成 `endpoints.generated.ts`：
   - endpoint 基础信息：`path` / `method` / `toolName` / `summary`
   - 参数信息：`name` / `in` / `required` / `type`
   - **必须提取参数 `description`（若 swagger 有）**
   - `enum` 字段预留（可选）
3. 生成 `core.ts`：参数校验与转换、上游请求、统一信封、错误映射。
4. 生成 `tools.generated.ts`：为每个 endpoint 注册一个 MCP tool，并构建 `inputSchema`。
5. 生成 `index.ts`（stdio 默认启动）和 `http.ts`（`/healthz` + `/proxy/*`）。
6. 生成测试并跑通：test + typecheck + build。
7. 对照本文 DoD 逐条自检，全部满足后结束。

---

## 1. 设计目标（必须同时满足）

1. **stdio MCP Server（默认）**
   - 将 swagger 全量 GET endpoints 转为 MCP tools。
2. **HTTP Proxy Server（扩展）**
   - 基于同一 endpoint registry 完成参数校验、路径匹配与上游转发。

---

## 2. 约束与命名

### 2.1 包命名

- 规则：`@darkhorseone/mcp-server-<slug>`
- 本项目固定：`@darkhorseone/mcp-server-uk-parliament-members`

### 2.2 运行协议

- 默认：`stdio`
- 扩展：`http`

### 2.3 技术栈约束

- TypeScript（strict）
- ESM（`type: module`）
- MCP SDK：`@modelcontextprotocol/sdk`
- 校验建模：`zod`
- 测试：`vitest`
- 构建：`tsup`

---

## 3. Swagger → Endpoint Registry 映射规范

### 3.1 类型定义（必须）

在 `src/endpoints.generated.ts` 定义：

```ts
export type ParameterType = 'string' | 'number' | 'boolean' | 'array:string' | 'array:number';

export interface EndpointParameter {
  name: string;
  in: 'path' | 'query';
  required: boolean;
  type: ParameterType;
  description?: string;
  enum?: Array<string | number | boolean>;
}

export interface EndpointDefinition {
  path: string;
  method: 'GET';
  toolName: string;
  summary: string;
  pathParams: EndpointParameter[];
  queryParams: EndpointParameter[];
}
```

### 3.2 参数 type 映射

从 OpenAPI parameter schema 映射到 `ParameterType`：

- `type: string` → `string`
- `type: integer|number` → `number`
- `type: boolean` → `boolean`
- `type: array` + `items.number|integer` → `array:number`
- `type: array` + `items.string` → `array:string`
- 对 `allOf` / `$ref`：解析到最终基础类型（若无法解析，默认按 `number`/`string` 保守映射并保持与现有 endpoint 行为一致）

### 3.3 description / enum 提取规则（关键）

- description：从 `paths[path].get.parameters[*].description` 提取。
- 匹配键：`endpoint.path + parameter.name + parameter.in`。
- 仅当 description 为非空字符串时写入 `EndpointParameter.description`。
- enum：若 parameter schema 中存在 enum（直接或经 `$ref` 解析可得），写入 `EndpointParameter.enum`。

### 3.4 工具名规则

建议稳定规则：

- 去掉前缀 `/api/`
- 按路径段 snake_case
- path 参数片段转换为语义后缀（例如 `{id}` + endpoint 语义）
- 最终保证唯一性（用测试约束）

> 本项目现有工具名已固定在 `ENDPOINTS`，新项目可复用此生成策略，但必须保证 deterministic（同一 swagger 多次生成结果一致）。

---

## 4. Runtime 规范（core.ts）

### 4.1 参数解析

- `number`：接受 number 或可解析数字字符串。
- `boolean`：接受 boolean 或字符串 `true|false|1|0`（不区分大小写）。
- `string`：必须为非空字符串。
- `array:number`：接受数组或逗号分隔字符串，逐项按 number 解析。
- `array:string`：接受数组或逗号分隔字符串，逐项按 string 解析。

### 4.2 required 校验

- 对 `required: true` 参数，`undefined | null | ''` 一律报错。
- 抛出 `EndpointValidationError`，并包含参数上下文。

### 4.3 Upstream 调用

- `apiBaseUrl` 默认：`https://members-api.parliament.uk`
- `requestTimeoutMs` 默认：`10000`
- 请求头：`accept: application/json, text/plain;q=0.9, */*;q=0.8`

### 4.4 标准成功信封

```json
{
  "status": 200,
  "data": {},
  "upstream_path": "/api/...",
  "retrieved_at": "ISO-8601"
}
```

### 4.5 标准错误信封

```json
{
  "status": 400,
  "error": {
    "code": "INVALID_PARAMS | UPSTREAM_TIMEOUT | UPSTREAM_NETWORK_ERROR | UPSTREAM_ERROR",
    "message": "...",
    "details": {}
  },
  "upstream_path": "/api/...",
  "retrieved_at": "ISO-8601"
}
```

状态码映射：

- 参数错误：400
- 上游超时：504
- 上游网络错误：502
- 未知内部错误：500

---

## 5. MCP Tool 规范（tools.generated.ts）

### 5.1 注册规则

- 每个 endpoint 注册一个 tool。
- `title = toolName`
- `description = endpoint.summary`
- `inputSchema = endpointInputSchema(endpoint)`

### 5.2 inputSchema 规则（Zod）

- 由 `pathParams + queryParams` 共同构建 `z.object(shape)`。
- required 参数为必填；其余 `.optional()`。
- 参数 `description` 写入 schema `describe(...)`，确保体现在 tools 元信息。
- 参数 `enum` 存在时，构建 literal union 合并到基础 schema。

### 5.3 tool handler 输出

- 成功：
  - `content: [{ type: 'text', text: JSON.stringify(result) }]`
  - `structuredContent: result`
- 失败：
  - `isError: true`
  - `content: [{ type: 'text', text: JSON.stringify(errorEnvelope) }]`
  - `structuredContent: errorEnvelope`

---

## 6. 入口规范

### 6.1 stdio（src/index.ts）

- 创建 `McpServer({ name, version })`
- 调用 `registerAllTools(server)`
- 通过 `StdioServerTransport` 连接
- 启动日志包含工具数量

### 6.2 HTTP（src/http.ts）

路由规范：

- `GET /healthz`
  - 返回 `{ status: 'ok', tools: ENDPOINTS.length, retrieved_at }`
- `GET /proxy/*`
  - 将 `/proxy/...` 转为 upstream path
  - 使用 `matchEndpointByResolvedPath` 进行 endpoint 匹配
  - 合并 pathInput + queryInput 后执行 `executeEndpoint`
- `/proxy/*` 非 GET → 405
- 未知 proxy 路径 → 404，并返回可用 endpoint 列表
- 其他路由 → 404

---

## 7. package.json 脚本要求（必须具备）

```json
{
  "scripts": {
    "build": "tsup src/index.ts src/http.ts --format esm --dts --clean",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "lint": "pnpm run typecheck",
    "test": "vitest run",
    "dev": "tsx src/index.ts",
    "start:http": "node dist/http.js",
    "inspect:local": "pnpm run build && npx -y @modelcontextprotocol/inspector node ./dist/index.js",
    "inspect:npm": "npx -y @modelcontextprotocol/inspector npx -y @darkhorseone/mcp-server-uk-parliament-members"
  }
}
```

---

## 8. 测试规范（最小覆盖）

### 8.1 endpoints.generated.test.ts

- endpoint 数量与 swagger 一致（本例 43）
- `toolName` 唯一
- `path` 唯一

### 8.2 http.proxy.test.ts

- path 参数 + query 参数拼接正确
- array query 生成重复键（如 `ids=1&ids=2`）
- required 参数缺失时报错

### 8.3 tools.generated.test.ts

- 注册工具数量等于 endpoint 数
- upstream timeout 映射到 `UPSTREAM_TIMEOUT` + 504
- 参数 `description` 与 `enum` 能出现在工具 input schema 元信息

---

## 9. README 要求（package 内独立 README）

`servers/<slug>/README.md` 至少包含：

- 包名与用途
- 环境变量
- 安装、构建、运行（stdio/http）
- healthz 与 proxy 示例
- Inspector 使用方式
- 包级 test/typecheck/build 命令

---

## 10. 交付验收（DoD）

以下全部满足才算完成：

1. 从 swagger `paths[*].get` 全量生成 endpoints（本例 43）。
2. stdio 默认可启动，tools 可列出并可调用。
3. HTTP `/healthz` 与 `/proxy/*` 行为符合规范。
4. `endpoints.generated.ts` 参数包含 `description`（swagger 有则必须写入）。
5. `tools.generated.ts` 将参数 `description/enum` 反映到 inputSchema 元信息。
6. 三组测试全部通过。
7. `typecheck` 与 `build` 通过。
8. package 内存在独立 README。

---

## 11. 执行命令（最终必须跑）

在仓库根目录执行：

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-members run build
```

---

## 12. 参考输入

- `docs/impl/uk-parliament-members/swagger.json`
- `https://members-api.parliament.uk/api`
- `https://www.npmjs.com/package/@modelcontextprotocol/inspector`
