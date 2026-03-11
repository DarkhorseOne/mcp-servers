# UK Parliament Oral Questions and Motions MCP Server 技术规格

> 目标：在仅提供本文件与 `swagger.json` 的条件下，可一次性完成实现、测试、构建与验收。

---

## 0. 一口气执行入口（必须按顺序）

### 0.1 输入与变量

```bash
SERVER_SLUG="uk-parliament-oralquestionsandmotions"
PACKAGE_NAME="@darkhorseone/mcp-server-${SERVER_SLUG}"
PACKAGE_DIR="servers/${SERVER_SLUG}"
IMPL_DIR="docs/impl/uk-parliament-oralquestionsandmotions"
SWAGGER_PATH="${IMPL_DIR}/swagger.json"
UPSTREAM_BASE_URL="https://oralquestionsandmotions-api.parliament.uk"
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

1. 读取 `${SWAGGER_PATH}`，提取 `paths[*].get` 全量 endpoint（本规格应为 4 个）。
2. 生成 `src/endpoints.generated.ts`：包含 path/method/toolName/summary/params，参数必须带 `description`，存在 enum 时写入 `enum`。
3. 生成 `src/core.ts`：参数校验与类型转换、上游请求、成功/错误信封、状态码映射。
4. 生成 `src/tools.generated.ts`：逐 endpoint 注册 MCP tool，构建 `inputSchema`。
5. 生成 `src/index.ts`（stdio）和 `src/http.ts`（`/healthz` + `/proxy/*`）。
6. 编写并通过测试：endpoint 覆盖、schema 映射、proxy 行为、错误映射。
7. 执行 typecheck/build/test，按本文 DoD 逐条验收。

---

## 1. 设计目标（必须同时满足）

1. 将 Oral Questions and Motions Swagger 的全部 GET 接口映射为 MCP tools。
2. 默认提供 stdio MCP server；同时提供 HTTP proxy 入口用于调试与集成。
3. 参数映射必须稳定、可预测（同一 swagger 多次生成结果一致）。
4. 错误行为标准化（参数错误、超时、网络错误、上游错误）。

---

## 2. 约束与命名

### 2.1 package 命名

- 固定：`@darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions`

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

- Host：`oralquestionsandmotions-api.parliament.uk`
- Schemes：`http`、`https`（实现默认强制使用 `https`）
- 鉴权：swagger 未定义 auth；默认无需 API key/OAuth
- 超时默认：`10000ms`

---

## 3. 需求源 → Endpoint/Tool 映射规范

### 3.1 Endpoint 范围

从 swagger 提取以下 4 个 GET 接口：

1. `GET /EarlyDayMotion/{id}`
2. `GET /EarlyDayMotions/list`
3. `GET /oralquestions/list`
4. `GET /oralquestiontimes/list`

### 3.2 参数类型映射

- `type: string` → `string`
- `type: integer|number` → `number`
- `type: boolean` → `boolean`
- `type: array` + `items.integer|number` → `array:number`
- `type: array` + `items.string` → `array:string`

### 3.3 required/optional 规则

- `required: true` 参数在 MCP inputSchema 中为必填。
- `required: false` 参数为可选。
- path 参数必须始终出现在输入 schema 中（且必填）。

### 3.4 description/enum 提取规则

- `description` 来源：`paths.<path>.get.parameters[*].description`。
- `enum` 来源：参数自身 schema 的 `enum`，或 `items.enum`（数组参数）。
- `description` 非空才落库到 endpoint metadata。
- `enum` 存在时必须注入 inputSchema 约束。

### 3.5 toolName 生成规则（稳定且唯一）

将 path 转 snake_case，并包含动作语义：

- `/EarlyDayMotion/{id}` → `get_early_day_motion_by_id`
- `/EarlyDayMotions/list` → `list_early_day_motions`
- `/oralquestions/list` → `list_oral_questions`
- `/oralquestiontimes/list` → `list_oral_question_times`

如发生冲突，追加稳定后缀（如 `_v2`）并由测试保证唯一性。

### 3.6 MCP 工具输入参数规范（按 endpoint）

#### A) `get_early_day_motion_by_id`

- `id` (`number`, required, path)

#### B) `list_early_day_motions`

- `parameters.edmIds` (`array:number`)
- `parameters.uINWithAmendmentSuffix` (`string`)
- `parameters.searchTerm` (`string`)
- `parameters.currentStatusDateStart` (`string`, format `date-time`)
- `parameters.currentStatusDateEnd` (`string`, format `date-time`)
- `parameters.isPrayer` (`boolean`)
- `parameters.memberId` (`number`)
- `parameters.includeSponsoredByMember` (`boolean`)
- `parameters.tabledStartDate` (`string`, format `date-time`)
- `parameters.tabledEndDate` (`string`, format `date-time`)
- `parameters.statuses` (`array:string`, enum: `Published|Withdrawn`)
- `parameters.orderBy` (`string`, enum: `DateTabledAsc|DateTabledDesc|TitleAsc|TitleDesc|SignatureCountAsc|SignatureCountDesc`)
- `parameters.skip` (`number`)
- `parameters.take` (`number`，建议额外校验 `<=100`)

#### C) `list_oral_questions`

- `parameters.answeringDateStart` (`string`, format `date-time`)
- `parameters.answeringDateEnd` (`string`, format `date-time`)
- `parameters.questionType` (`string`, enum: `Substantive|Topical`)
- `parameters.oralQuestionTimeId` (`number`)
- `parameters.statuses` (`array:string`, enum: `Submitted|Carded|Unsaved|ReadyForShuffle|ToBeAsked|ShuffleUnsuccessful|Withdrawn|Unstarred|Draft|ForReview|Unasked|Transferred`)
- `parameters.askingMemberIds` (`array:number`)
- `parameters.uINs` (`array:number`)
- `parameters.answeringBodyIds` (`array:number`)
- `parameters.skip` (`number`)
- `parameters.take` (`number`，建议额外校验 `<=100`)

#### D) `list_oral_question_times`

- `parameters.answeringDateStart` (`string`, format `date-time`)
- `parameters.answeringDateEnd` (`string`, format `date-time`)
- `parameters.deadlineDateStart` (`string`, format `date-time`)
- `parameters.deadlineDateEnd` (`string`, format `date-time`)
- `parameters.oralQuestionTimeId` (`number`)
- `parameters.answeringBodyIds` (`array:number`)
- `parameters.skip` (`number`)
- `parameters.take` (`number`，建议额外校验 `<=100`)

---

## 4. Runtime 规范

### 4.1 参数解析

- `number`：接受 number 或可转换数字字符串。
- `boolean`：接受 boolean 或字符串 `true|false|1|0`（大小写不敏感）。
- `string`：必须是字符串；如为空字符串且参数 required，则报错。
- `array:number` / `array:string`：支持数组输入或逗号分隔字符串；序列化到 query 时使用重复键（`collectionFormat=multi`）。

### 4.2 required 校验

- 对 required 参数，`undefined | null | ''` 一律视为缺失。
- 缺失或类型错误抛 `EndpointValidationError`，并带参数名、期望类型、实际值。

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
  "upstream_path": "/oralquestions/list",
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
  "upstream_path": "/oralquestions/list",
  "retrieved_at": "ISO-8601"
}
```

状态码：

- 参数错误：`400`
- 上游超时：`504`
- 上游网络错误：`502`
- 上游返回非 2xx：透传原始状态码，并用 `UPSTREAM_ERROR`
- 未知内部错误：`500`

### 4.6 Swagger 不一致处理规则（必须实现）

该 swagger 存在响应 schema 引用与 endpoint 语义不完全一致（例如多个 list endpoint 声明为 `ApiResponse[List[PublishedWrittenQuestion]]`）。实现必须遵循：

1. 运行时不以响应 `$ref` 强行反序列化为固定 TS 类型；保留上游原始 JSON。
2. endpoint 与参数行为完全按 `paths` 定义执行。
3. 文档/README 标注“响应模型以实际上游返回为准”。

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
- 参数 `description` 必须写入 schema 元信息。
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
    "inspect:npm": "npx -y @modelcontextprotocol/inspector npx -y @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions"
  }
}
```

---

## 8. 测试规范（最小覆盖）

### 8.1 `test/endpoints.generated.test.ts`

- endpoint 数量必须为 4。
- `toolName` 全局唯一。
- `path + method` 全局唯一。
- 每个参数的 `description` 与 swagger 一致（swagger 有则必须存在）。
- 每个含 enum 的参数，`enum` 内容与 swagger 一致。

### 8.2 `test/tools.generated.test.ts`

- 注册 tool 数量等于 endpoint 数量。
- 每个 tool 的 inputSchema required/optional 与 swagger 一致。
- 参数 description/enum 正确反映到 schema。
- 参数错误返回 `INVALID_PARAMS` + 400。

### 8.3 `test/http.proxy.test.ts`

- `/healthz` 正常返回工具数量。
- `/proxy/EarlyDayMotion/{id}` path 参数映射正确。
- list 接口数组 query 序列化为 multi 重复键。
- 上游超时映射为 `UPSTREAM_TIMEOUT` + 504。
- unknown route 返回 404。

---

## 9. README 要求

`servers/uk-parliament-oralquestionsandmotions/README.md` 至少包含：

- 包名、能力范围（4 个工具）
- 环境变量（`UPSTREAM_BASE_URL`、`REQUEST_TIMEOUT_MS`）
- stdio 与 http 启动方式
- `/healthz` 与 `/proxy/*` 示例
- MCP Inspector 示例
- 测试/typecheck/build 命令
- swagger 响应模型不一致的兼容策略说明（以实际上游返回为准）

---

## 10. 交付验收（DoD）

以下全部满足才算交付完成：

1. swagger 的 4 个 GET endpoint 均已生成并可调用。
2. 每个 endpoint 的参数 required/type/description/enum 映射正确。
3. stdio MCP server 可启动并列出 4 个 tools。
4. HTTP `healthz/proxy` 行为符合规范。
5. 统一成功/错误信封与状态码映射符合第 4 节。
6. 三组测试全部通过。
7. package 级 `typecheck`、`build` 通过。
8. package 内 README 完整且包含兼容策略。

---

## 11. 执行命令（最终必须跑）

在仓库根目录执行：

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-oralquestionsandmotions run build
```

---

## 12. 参考输入

- `docs/guide.md`
- `docs/impl/uk-parliament-oralquestionsandmotions/swagger.json`
- `https://oralquestionsandmotions-api.parliament.uk`
- `https://www.npmjs.com/package/@modelcontextprotocol/inspector`
