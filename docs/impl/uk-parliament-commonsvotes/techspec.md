# UK Parliament Commons Votes MCP Server 技术规格

> 目标：仅基于本文件 + `swagger.json`，一次性完成可运行的 MCP server 实现（代码、测试、构建、文档）。

---

## 0. 一口气执行入口（严格）

### 0.1 输入与变量

```bash
SERVER_SLUG="uk-parliament-commonsvotes"
PACKAGE_NAME="@darkhorseone/mcp-server-${SERVER_SLUG}"
PACKAGE_DIR="servers/${SERVER_SLUG}"
SWAGGER_PATH="docs/impl/uk-parliament-commonsvotes/swagger.json"
```

### 0.2 产物文件清单（必须完整）

在 `${PACKAGE_DIR}` 生成并维护：

- `package.json`
- `tsconfig.json`
- `README.md`
- `src/index.ts`（stdio MCP 入口）
- `src/http.ts`（HTTP proxy 入口）
- `src/core.ts`（参数解析、上游调用、错误映射）
- `src/endpoints.generated.ts`（由 swagger 生成）
- `src/tools.generated.ts`（工具注册 + input schema）
- `test/endpoints.generated.test.ts`
- `test/tools.generated.test.ts`
- `test/http.proxy.test.ts`

### 0.3 端到端步骤（严格顺序）

1. 读取 `swagger.json`，提取全部 `paths[*].get`（本项目应为 **5** 个）。
2. 生成 `endpoints.generated.ts`：包含 path/method/toolName/summary/params。
3. 参数级别必须写入 `description`；本 swagger 无 enum 时不强行写入。
4. 生成 `core.ts`：参数解析、query 编码、上游调用、统一错误映射。
5. 生成 `tools.generated.ts`：注册 MCP tools + inputSchema（含 description）。
6. 生成 `index.ts`（stdio）和 `http.ts`（`/healthz` + `/proxy/*`）。
7. 生成并通过最小测试集 + typecheck + build。
8. 对照 DoD 全部通过后结束。

---

## 1. 设计目标（必须同时满足）

1. **stdio MCP Server（默认）**：将 5 个 GET endpoint 转成 MCP tools。
2. **HTTP Proxy Server（扩展）**：共享 endpoint registry 与参数规则。
3. **参数透传稳定**：支持 path 参数和 queryParameters.* 参数原样映射。

---

## 2. 约束与命名

### 2.1 包命名

- 规则：`@darkhorseone/mcp-server-<slug>`
- 本项目：`@darkhorseone/mcp-server-uk-parliament-commonsvotes`

### 2.2 技术栈

- TypeScript strict
- Node ESM
- `@modelcontextprotocol/sdk`
- `zod`
- `vitest`
- `tsup`

### 2.3 环境变量

- `UKPCV_API_BASE_URL`（默认：`https://commonsvotes-api.parliament.uk`）
- `UKPCV_REQUEST_TIMEOUT_MS`（默认 `10000`）
- `UKPCV_HTTP_PORT`（HTTP 模式默认 `8787`）

---

## 3. Swagger → Endpoint Registry 映射规范

### 3.1 类型定义（必须）

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

### 3.2 endpoint 清单（本 swagger）

1. `GET /data/division/{divisionId}.{format}`
2. `GET /data/divisions.{format}/groupedbyparty`
3. `GET /data/divisions.{format}/membervoting`
4. `GET /data/divisions.{format}/search`
5. `GET /data/divisions.{format}/searchTotalResults`

### 3.3 参数映射规则

- OpenAPI2 `type: integer|number` → `number`
- `type: boolean` → `boolean`
- `type: string` → `string`

### 3.4 参数命名与透传规则（关键）

- 对 swagger 参数名保持**原样**（包括点号命名，如 `queryParameters.memberId`）。
- path 参数 `{format}`、`{divisionId}` 必须参与 URL 替换。
- query 参数全部按原键名透传（不做 camelCase/alias 重写）。

### 3.5 description / enum 提取规则

- `description` 来源：`paths[path].get.parameters[*].description`
- 匹配键：`path + parameter.name + parameter.in`
- 若参数含 enum 才写入 `enum`；本 swagger 当前无参数 enum。

### 3.6 toolName 规则（deterministic）

- 统一前缀：`ukpcv_`
- 路径语义稳定映射（同一 swagger 多次生成不变）

---

## 4. Runtime 规范（core.ts）

### 4.1 参数解析

- `number`：接受 number 或数字字符串
- `boolean`：接受 boolean 或 `true/false/1/0`
- `string`：接受非空字符串
- path 参数一律 required

### 4.2 required 校验

- required 参数缺失（`undefined | null | ''`）→ `EndpointValidationError`

### 4.3 query 编码

- 仅对有值参数拼接 query
- `queryParameters.*` 参数名按原样编码，不替换点号

### 4.4 Upstream 调用

- base URL: `UKPCV_API_BASE_URL`
- timeout: `UKPCV_REQUEST_TIMEOUT_MS`（默认 10000）
- method: GET
- `accept: application/json, text/plain;q=0.9, */*;q=0.8`

### 4.5 成功/错误 envelope

成功：

```json
{
  "status": 200,
  "data": {},
  "upstream_path": "/data/...",
  "retrieved_at": "ISO-8601"
}
```

错误：

```json
{
  "status": 400,
  "error": {
    "code": "INVALID_PARAMS | UPSTREAM_TIMEOUT | UPSTREAM_NETWORK_ERROR | UPSTREAM_ERROR",
    "message": "...",
    "details": {}
  },
  "upstream_path": "/data/...",
  "retrieved_at": "ISO-8601"
}
```

状态码映射：

- 参数错误：400
- 上游超时：504
- 上游网络错误：502
- 其他未分类错误：500

---

## 5. MCP Tool 规范（tools.generated.ts）

### 5.1 注册规则

- 每个 endpoint 一个 tool
- `title = toolName`
- `description = endpoint.summary`
- `inputSchema = endpointInputSchema(endpoint)`

### 5.2 inputSchema 规则（Zod）

- path + query 参数共同构建 `z.object(shape)`
- required 参数必填，其余 `.optional()`
- `description` 写入 `.describe(...)`

### 5.3 handler 输出

- 成功：`content(text)` + `structuredContent`
- 失败：`isError: true` + 错误 envelope 的 `content(text)` + `structuredContent`

---

## 6. 入口规范

### 6.1 stdio（src/index.ts）

- 初始化 `McpServer({ name, version })`
- `registerAllTools(server)`
- `StdioServerTransport` 连接

### 6.2 HTTP（src/http.ts）

- `GET /healthz`：返回 `{ status: 'ok', tools, retrieved_at }`
- `GET /proxy/*`：
  - 路径匹配 endpoint
  - 解析 path/query 参数
  - 调用统一执行器
- `405`：`/proxy/*` 的非 GET 请求
- `404`：未知路径

---

## 7. package.json 脚本要求（必须）

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
    "inspect:npm": "npx -y @modelcontextprotocol/inspector npx -y -p @darkhorseone/mcp-server-uk-parliament-commonsvotes mcp-server-uk-parliament-commonsvotes"
  }
}
```

---

## 8. 测试规范（最小覆盖）

### 8.1 endpoints.generated.test.ts

- endpoint 数量 = 5
- `toolName` 唯一
- `path` 唯一

### 8.2 tools.generated.test.ts

- 注册工具数量 = endpoint 数
- 参数 description 出现在 schema
- timeout 映射为 `UPSTREAM_TIMEOUT`

### 8.3 http.proxy.test.ts

- path/query 参数拼接正确
- required path 参数缺失时报错
- `/proxy/*` 非 GET 返回 405

---

## 9. README 要求（package 内独立 README）

至少包含：

- 包用途与上游 API 说明
- 环境变量
- stdio/http 启动方式
- AI Agent MCP 配置示例
- Inspector 配置示例（显式 `transportType: stdio`）
- test/typecheck/build 命令
- MIT / repository / author

---

## 10. 交付验收（DoD）

必须全部满足：

1. 5 个 GET endpoint 全量生成为 tools
2. 参数 description 全量提取
3. path + query 参数透传稳定（含 `queryParameters.*`）
4. stdio 与 http 入口可运行
5. 测试全通过
6. typecheck 与 build 通过
7. package 独立 README 完整

---

## 11. 执行命令（最终必须跑）

在仓库根目录：

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-commonsvotes run build
```

---

## 12. 参考输入

- `docs/impl/uk-parliament-commonsvotes/swagger.json`
- `docs/guide.md`
- `https://commonsvotes-api.parliament.uk`
