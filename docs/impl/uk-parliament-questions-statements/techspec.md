# UK Parliament Questions and Statements MCP Server 技术规格

> 目标：在仅提供本文件与 `swagger.json` 的条件下，可一次性完成实现、测试、构建与验收。

---

## 0. 一口气执行入口（必须按顺序）
### 0.1 输入与变量

```bash
SERVER_SLUG="uk-parliament-questions-statements"
PACKAGE_NAME="@darkhorseone/mcp-server-${SERVER_SLUG}"
PACKAGE_DIR="servers/${SERVER_SLUG}"
IMPL_DIR="docs/impl/uk-parliament-questions-statements"
SWAGGER_PATH="${IMPL_DIR}/swagger.json"
UPSTREAM_BASE_URL="https://questions-statements-api.parliament.uk"
```

### 0.2 产物文件清单（必须完整）

在 `${PACKAGE_DIR}` 生成并维护：

- `package.json`
- `tsconfig.json`
- `README.md`
- `src/index.ts`（stdio MCP 入口）
- `src/http.ts`（HTTP proxy 入口）
- `src/core.ts`（参数解析、上游调用、错误映射）
- `src/endpoints.generated.ts`（swagger 到 endpoint registry）
- `src/tools.generated.ts`（MCP tools 注册与 input schema）
- `test/endpoints.generated.test.ts`
- `test/tools.generated.test.ts`
- `test/http.proxy.test.ts`

### 0.3 端到端步骤（严格顺序）

1. 读取 `${SWAGGER_PATH}`，提取 `paths[*].get` 全量 endpoint（本规格应为 7 个）。
2. 生成 `src/endpoints.generated.ts`：包含 path/method/toolName/summary/params，参数必须带 `description`，存在 enum 时写入 `enum`。
3. 生成 `src/core.ts`：参数校验与类型转换、上游请求、成功/错误信封、状态码映射。
4. 生成 `src/tools.generated.ts`：逐 endpoint 注册 MCP tool，构建 `inputSchema`。
5. 生成 `src/index.ts`（stdio）和 `src/http.ts`（`/healthz` + `/proxy/*`）。
6. 编写并通过测试：endpoint 覆盖、schema 映射、proxy 行为、错误映射。
7. 执行 typecheck/build/test，按本文 DoD 逐条验收。

---

## 1. 设计目标（必须同时满足）

1. 将 Written Questions & Statements Swagger 的全部 GET 接口映射为 MCP tools。
2. 默认提供 stdio MCP server；同时提供 HTTP proxy 入口用于调试与集成。
3. 参数映射必须稳定、可预测（同一 swagger 多次生成结果一致）。
4. 错误行为标准化（参数错误、超时、网络错误、上游错误）。

---

## 2. 约束与命名

### 2.1 package 命名

- 固定：`@darkhorseone/mcp-server-uk-parliament-questions-statements`

### 2.2 运行协议

- 默认：`stdio`
- 扩展：`http`

### 2.3 技术栈

- TypeScript（strict，NodeNext）
- ESM（`type: module`）
- `@modelcontextprotocol/sdk`
- `zod`
- `vitest`
- `tsup`

### 2.4 上游 API 基线

- Host：`questions-statements-api.parliament.uk`
- Schemes：`http`、`https`（实现默认强制使用 `https`）
- 鉴权：swagger 未定义 auth；默认无需 API key/OAuth
- 超时默认：`10000ms`

---

## 3. 需求源 → Endpoint/Tool 映射规范

### 3.1 Endpoint 范围

从 swagger 提取以下 7 个 GET 接口：

1. `GET /api/dailyreports/dailyreports`
2. `GET /api/writtenquestions/questions`
3. `GET /api/writtenquestions/questions/{id}`
4. `GET /api/writtenquestions/questions/{date}/{uin}`
5. `GET /api/writtenstatements/statements`
6. `GET /api/writtenstatements/statements/{id}`
7. `GET /api/writtenstatements/statements/{date}/{uin}`

### 3.2 参数类型映射

- `type: string` → `string`
- `type: integer|number` → `number`
- `type: boolean` → `boolean`
- `type: array` + `items.integer|number` → `array:number`
- `type: array` + `items.string` → `array:string`
- schema `$ref` 指向 enum 时，基础类型按 `string` 处理并附带 `enum`

### 3.3 required/optional 规则

- `required: true` 参数在 MCP inputSchema 中为必填。
- `required: false` 或未标注参数为可选。
- path 参数必须始终出现在输入 schema 中（且必填）。

### 3.4 description/enum 提取规则

- `description` 来源：`paths.<path>.get.parameters[*].description`。
- `enum` 来源：参数 schema 的 `enum`，或 `$ref` 到 enum schema 后解析出的值。
- `description` 非空才落库到 endpoint metadata。
- `enum` 存在时必须注入 inputSchema 约束。

### 3.5 toolName 生成规则（稳定且唯一）

命名规范：`<动作>_<资源>[_by_<标识>]`，全部 snake_case。

固定映射：

- `/api/dailyreports/dailyreports` → `list_daily_reports`
- `/api/writtenquestions/questions` → `list_written_questions`
- `/api/writtenquestions/questions/{id}` → `get_written_question_by_id`
- `/api/writtenquestions/questions/{date}/{uin}` → `get_written_question_by_date_and_uin`
- `/api/writtenstatements/statements` → `list_written_statements`
- `/api/writtenstatements/statements/{id}` → `get_written_statement_by_id`
- `/api/writtenstatements/statements/{date}/{uin}` → `get_written_statement_by_date_and_uin`

### 3.6 MCP 工具输入参数规范（按 endpoint）

#### A) `list_daily_reports`

- `dateFrom` (`string`, query)
- `dateTo` (`string`, query)
- `house` (`string`, query, enum: `HouseEnum`)
- `skip` (`number`, query)
- `take` (`number`, query)

#### B) `list_written_questions`

- `askingMemberId` (`number`, query)
- `answeringMemberId` (`number`, query)
- `tabledWhenFrom` (`string`, query)
- `tabledWhenTo` (`string`, query)
- `dateForAnswerWhenFrom` (`string`, query)
- `dateForAnswerWhenTo` (`string`, query)
- `answered` (`string`, query, enum: `Answered`)
- `answeredWhenFrom` (`string`, query)
- `answeredWhenTo` (`string`, query)
- `questionStatus` (`string`, query, enum: `QuestionStatusEnum`)
- `includeWithdrawn` (`boolean`, query)
- `expandMember` (`boolean`, query)
- `correctedWhenFrom` (`string`, query)
- `correctedWhenTo` (`string`, query)
- `sessionStatus` (`string`, query, enum: `SessionStatus`)
- `searchTerm` (`string`, query)
- `uIN` (`string`, query)
- `answeringBodies` (`array:number`, query)
- `members` (`array:number`, query)
- `house` (`string`, query, enum: `HouseEnum`)
- `skip` (`number`, query)
- `take` (`number`, query)

#### C) `get_written_question_by_id`

- `id` (`number`, required, path)
- `expandMember` (`boolean`, query)
- `sessionStatus` (`string`, query, enum: `SessionStatus`)

#### D) `get_written_question_by_date_and_uin`

- `date` (`string`, required, path)
- `uin` (`string`, required, path)
- `expandMember` (`boolean`, query)
- `sessionStatus` (`string`, query, enum: `SessionStatus`)

#### E) `list_written_statements`

- `madeWhenFrom` (`string`, query)
- `madeWhenTo` (`string`, query)
- `sessionStatus` (`string`, query, enum: `SessionStatus`)
- `searchTerm` (`string`, query)
- `uIN` (`string`, query)
- `answeringBodies` (`array:number`, query)
- `members` (`array:number`, query)
- `house` (`string`, query, enum: `HouseEnum`)
- `skip` (`number`, query)
- `take` (`number`, query)
- `expandMember` (`boolean`, query)

#### F) `get_written_statement_by_id`

- `id` (`number`, required, path)
- `expandMember` (`boolean`, query)
- `sessionStatus` (`string`, query, enum: `SessionStatus`)

#### G) `get_written_statement_by_date_and_uin`

- `date` (`string`, required, path)
- `uin` (`string`, required, path)
- `expandMember` (`boolean`, query)
- `sessionStatus` (`string`, query, enum: `SessionStatus`)

---

## 4. Runtime 规范

### 4.1 参数解析

- `number`：接受 number 或可转换数字字符串。
- `boolean`：接受 boolean 或字符串 `true|false|1|0`（大小写不敏感）。
- `string`：必须是字符串；如为空字符串且参数 required，则报错。
- `array:number` / `array:string`：支持数组输入或逗号分隔字符串；序列化 query 使用重复键。

### 4.2 required 校验

- 对 required 参数，`undefined | null | ''` 一律视为缺失。
- 缺失或类型错误抛 `EndpointValidationError`，并包含参数名、期望类型、实际值。

### 4.3 上游调用与请求构造

- URL：`${UPSTREAM_BASE_URL}${resolvedPath}?<query>`
- Header：`accept: application/json, text/json;q=0.9, */*;q=0.8`
- 超时：默认 `10000ms`（可配置）
- Query 构造：
  - 数组参数采用重复键（`a=1&a=2`）
  - 布尔值标准化为 `true|false`

### 4.4 成功信封

```json
{
  "status": 200,
  "data": {},
  "upstream_path": "/api/writtenquestions/questions",
  "retrieved_at": "ISO-8601"
}
```

### 4.5 错误信封与状态码映射

```json
{
  "status": 400,
  "error": {
    "code": "INVALID_PARAMS | UPSTREAM_TIMEOUT | UPSTREAM_NETWORK_ERROR | UPSTREAM_ERROR",
    "message": "...",
    "details": {}
  },
  "upstream_path": "/api/writtenquestions/questions",
  "retrieved_at": "ISO-8601"
}
```

状态码：

- 参数错误：`400`
- 上游超时：`504`
- 上游网络错误：`502`
- 上游返回非 2xx：透传原始状态码，并用 `UPSTREAM_ERROR`
- 未知内部错误：`500`

### 4.6 Swagger 响应模型处理规则

- 不强行以 schema 反序列化响应；保留上游原始 JSON。
- endpoint 与参数行为完全按 `paths` 定义执行。
- README 标注“响应模型以实际上游返回为准”。

---

## 5. MCP Tool 规范

### 5.1 注册规则

- 每个 endpoint 注册 1 个 tool。
- `title = toolName`
- `description = endpoint.summary`（无 summary 时退化为 path）
- `inputSchema` 由 pathParams + queryParams 共同构建。

### 5.2 inputSchema 规则

- required 参数为必填。
- optional 参数 `.optional()`。
- 参数 `description` 存在时写入 schema 元信息。
- 参数 `enum` 存在时，必须在 schema 侧形成约束。

### 5.3 handler 输出规则

- 成功：
  - `content: [{ type: 'text', text: JSON.stringify(result) }]`
  - `structuredContent: result`
- 失败：
  - `isError: true`
  - `content: [{ type: 'text', text: JSON.stringify(errorEnvelope) }]`
  - `structuredContent: errorEnvelope`

---

## 6. 入口规范

### 6.1 stdio（`src/index.ts`）

- 启动 MCP server，注册全部 tools。
- 使用 `StdioServerTransport`。
- 启动日志输出 package 名称与工具总数。

### 6.2 http（`src/http.ts`）

- `GET /healthz`：返回 `{ status: 'ok', tools: ENDPOINTS.length, retrieved_at }`
- `GET /proxy/*`：
  - 匹配 endpoint
  - 解析 path/query 参数
  - 调用统一执行器
  - 返回标准成功/错误信封
- 非 GET 请求到 `/proxy/*`：`405`
- 未匹配到 endpoint：`404`（附带可用 path 列表）

---

## 7. package.json 脚本要求

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
    "inspect:npm": "npx -y @modelcontextprotocol/inspector npx -y @darkhorseone/mcp-server-uk-parliament-questions-statements"
  }
}
```

---

## 8. 测试规范（最小覆盖）

### 8.1 `test/endpoints.generated.test.ts`

- endpoint 数量必须为 7。
- `toolName` 全局唯一。
- `path + method` 全局唯一。
- 每个参数 `description` 与 swagger 一致（swagger 有则必须存在）。
- 每个含 enum 参数，`enum` 内容与 swagger 一致（含 `$ref` enum）。

### 8.2 `test/tools.generated.test.ts`

- 注册 tool 数量等于 endpoint 数量。
- 每个 tool 的 inputSchema required/optional 与 swagger 一致。
- 参数 description/enum 正确反映到 schema。
- 参数错误返回 `INVALID_PARAMS` + 400。

### 8.3 `test/http.proxy.test.ts`

- `/healthz` 正常返回工具数量。
- path 参数映射正确（例如 `/api/writtenquestions/questions/{id}`）。
- array query 序列化为 multi 重复键（如 `answeringBodies=1&answeringBodies=2`）。
- 上游超时映射为 `UPSTREAM_TIMEOUT` + 504。
- unknown route 返回 404。

---

## 9. README 要求

`servers/uk-parliament-questions-statements/README.md` 至少包含：

- 包名、能力范围（7 个工具）
- 环境变量（`UPSTREAM_BASE_URL`、`REQUEST_TIMEOUT_MS`）
- stdio 与 http 启动方式
- `/healthz` 与 `/proxy/*` 示例
- MCP Inspector 示例
- 测试/typecheck/build 命令
- swagger 响应模型兼容策略说明（以实际上游返回为准）

---

## 10. 交付验收（DoD）

以下全部满足才算交付完成：

1. swagger 的 7 个 GET endpoint 均已生成并可调用。
2. 每个 endpoint 的参数 required/type/description/enum 映射正确。
3. stdio MCP server 可启动并列出 7 个 tools。
4. HTTP `healthz/proxy` 行为符合规范。
5. 统一成功/错误信封与状态码映射符合第 4 节。
6. 三组测试全部通过。
7. package 级 `typecheck`、`build` 通过。
8. package 内 README 完整且包含兼容策略。

---

## 11. 执行命令（最终必须跑）

在仓库根目录执行：

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-questions-statements run build
```

---

## 12. 参考输入

- `docs/guide.md`
- `docs/impl/uk-parliament-questions-statements/swagger.json`
- `https://questions-statements-api.parliament.uk`
- `https://www.npmjs.com/package/@modelcontextprotocol/inspector`
