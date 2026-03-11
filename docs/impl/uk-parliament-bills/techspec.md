# UK Parliament Bills MCP Server 技术规格

> 目标：在仅提供本文件与 `swagger.json` 的条件下，可一次性完成实现、测试、构建与验收。

---

## 0. 一口气执行入口（必须按顺序）

### 0.1 输入与变量

```bash
SERVER_SLUG="uk-parliament-bills"
PACKAGE_NAME="@darkhorseone/mcp-server-${SERVER_SLUG}"
PACKAGE_DIR="servers/${SERVER_SLUG}"
IMPL_DIR="docs/impl/uk-parliament-bills"
SWAGGER_PATH="${IMPL_DIR}/swagger.json"
UPSTREAM_BASE_URL="https://bills-api.parliament.uk"
```

### 0.2 产物文件清单（必须完整）

在 `${PACKAGE_DIR}` 生成并维护：

- `package.json`
- `tsconfig.json`
- `README.md`
- `scripts/add-shebang.mjs`
- `scripts/verify-tarball-shebang.mjs`
- `src/index.ts`（stdio MCP 入口）
- `src/http.ts`（HTTP proxy 入口）
- `src/core.ts`（参数解析、上游调用、错误映射）
- `src/endpoints.generated.ts`（swagger 到 endpoint registry）
- `src/tools.generated.ts`（MCP tools 注册与 input schema）
- `test/endpoints.generated.test.ts`
- `test/tools.generated.test.ts`
- `test/http.proxy.test.ts`

### 0.3 端到端步骤（严格顺序）

1. 读取 `${SWAGGER_PATH}`，提取 `paths[*].get` 全量 endpoint（本规格应为 21 个）。
2. 生成 `src/endpoints.generated.ts`：包含 path/method/toolName/summary/params，参数尽量带 `description`（swagger 无描述可留空）。
3. 生成 `src/core.ts`：参数校验与类型转换、上游请求、成功/错误信封、状态码映射。
4. 生成 `src/tools.generated.ts`：逐 endpoint 注册 MCP tool，构建 `inputSchema`。
5. 生成 `src/index.ts`（stdio）和 `src/http.ts`（`/healthz` + `/proxy/*`）。
6. 编写并通过测试：endpoint 覆盖、schema 映射、proxy 行为、错误映射。
7. 执行 typecheck/build/test，按本文 DoD 逐条验收。

---

## 1. 设计目标（必须同时满足）

1. 将 Bills Swagger 的全部 GET 接口映射为 MCP tools。
2. 默认提供 stdio MCP server；同时提供 HTTP proxy 入口用于调试与集成。
3. 参数映射稳定、可预测（同一 swagger 多次生成结果一致）。
4. 错误行为标准化（参数错误、超时、网络错误、上游错误）。

---

## 2. 约束与命名

### 2.1 package 命名

- 固定：`@darkhorseone/mcp-server-uk-parliament-bills`

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

- Host：`bills-api.parliament.uk`
- Schemes：默认使用 `https`
- 鉴权：swagger 未定义 auth；默认无需 API key/OAuth
- 超时默认：`10000ms`

---

## 3. 需求源 → Endpoint/Tool 映射规范

### 3.1 Endpoint 范围

从 swagger 提取以下 21 个 GET 接口：

1. `GET /api/v1/Bills/{billId}/Stages/{billStageId}/Amendments`
2. `GET /api/v1/Bills/{billId}/Stages/{billStageId}/Amendments/{amendmentId}`
3. `GET /api/v1/Bills/{billId}/NewsArticles`
4. `GET /api/v1/BillTypes`
5. `GET /api/v1/Bills`
6. `GET /api/v1/Bills/{billId}`
7. `GET /api/v1/Bills/{billId}/Stages/{billStageId}`
8. `GET /api/v1/Bills/{billId}/Stages`
9. `GET /api/v1/Publications/{publicationId}/Documents/{documentId}`
10. `GET /api/v1/Publications/{publicationId}/Documents/{documentId}/Download`
11. `GET /api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems`
12. `GET /api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems/{pingPongItemId}`
13. `GET /api/v1/PublicationTypes`
14. `GET /api/v1/Bills/{billId}/Publications`
15. `GET /api/v1/Bills/{billId}/Stages/{stageId}/Publications`
16. `GET /api/v1/Rss/allbills.rss`
17. `GET /api/v1/Rss/publicbills.rss`
18. `GET /api/v1/Rss/privatebills.rss`
19. `GET /api/v1/Rss/Bills/{id}.rss`
20. `GET /api/v1/Sittings`
21. `GET /api/v1/Stages`

### 3.2 参数类型映射

- `type: string` → `string`
- `type: integer|number` → `number`
- `type: boolean` → `boolean`
- `type: array` + `items.integer|number` → `array:number`
- `type: array` + `items.string` → `array:string`
- 参数 schema 为 `$ref` 且目标是 enum（例如 `House`, `BillTypeCategory`, `BillSortOrder`）时，映射为原始标量类型并附带 `enum` 列表。

### 3.3 required/optional 规则

- `required: true` 参数在 MCP inputSchema 中为必填。
- `required: false` 或未标注参数为可选。
- path 参数必须始终出现在输入 schema 中（且必填）。

### 3.4 description/enum 提取规则

- `description` 来源：`paths.<path>.get.parameters[*].description`。
- swagger 缺失 `description` 时，不强制补默认描述。
- 必须解析并保留以下 enum（当前 swagger 参数会用到）：
  - `AmendmentDecisionSearch`
  - `BillTypeCategory`
  - `House`
  - `OriginatingHouse`
  - `BillSortOrder`

### 3.5 toolName 生成规则（稳定且唯一）

命名规范：`<动作>_<资源>[_by_<标识>]`，全部 snake_case。

固定映射：

- `/api/v1/Bills/{billId}/Stages/{billStageId}/Amendments` → `search_bill_stage_amendments`
- `/api/v1/Bills/{billId}/Stages/{billStageId}/Amendments/{amendmentId}` → `get_bill_stage_amendment`
- `/api/v1/Bills/{billId}/NewsArticles` → `list_bill_news_articles`
- `/api/v1/BillTypes` → `list_bill_types`
- `/api/v1/Bills` → `search_bills`
- `/api/v1/Bills/{billId}` → `get_bill`
- `/api/v1/Bills/{billId}/Stages/{billStageId}` → `get_bill_stage_details`
- `/api/v1/Bills/{billId}/Stages` → `list_bill_stages`
- `/api/v1/Publications/{publicationId}/Documents/{documentId}` → `get_publication_document`
- `/api/v1/Publications/{publicationId}/Documents/{documentId}/Download` → `download_publication_document`
- `/api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems` → `search_bill_stage_ping_pong_items`
- `/api/v1/Bills/{billId}/Stages/{billStageId}/PingPongItems/{pingPongItemId}` → `get_bill_stage_ping_pong_item`
- `/api/v1/PublicationTypes` → `list_publication_types`
- `/api/v1/Bills/{billId}/Publications` → `list_bill_publications`
- `/api/v1/Bills/{billId}/Stages/{stageId}/Publications` → `list_bill_stage_publications`
- `/api/v1/Rss/allbills.rss` → `get_rss_all_bills`
- `/api/v1/Rss/publicbills.rss` → `get_rss_public_bills`
- `/api/v1/Rss/privatebills.rss` → `get_rss_private_bills`
- `/api/v1/Rss/Bills/{id}.rss` → `get_rss_bill_by_id`
- `/api/v1/Sittings` → `search_sittings`
- `/api/v1/Stages` → `list_stage_references`

### 3.6 MCP 工具输入参数规范（按主要 endpoint 类别）

#### A) Bill / Stage / Amendment 查询

- `billId`, `billStageId`, `amendmentId`, `pingPongItemId`, `publicationId`, `documentId`, `id`, `stageId`: `number` path 参数（required）。
- `Skip`, `Take`, `Session`, `MemberId`, `DepartmentId`: `number` query 参数。
- `SearchTerm`, `AmendmentNumber`: `string` query 参数。
- `BillStage`, `BillStagesExcluded`, `BillType`, `BillIds`: `array:number` query 参数。
- `IsDefeated`, `IsWithdrawn`, `IsInAmendableStage`: `boolean` query 参数。

#### B) Enum 查询参数

- `Decision`: enum `AmendmentDecisionSearch`
- `Category`: enum `BillTypeCategory`
- `CurrentHouse`: enum `House`
- `OriginatingHouse`: enum `OriginatingHouse`
- `SortOrder`: enum `BillSortOrder`
- `House`（sittings 查询参数）: enum `House`

#### C) 日期查询参数

- `DateFrom`, `DateTo`: `string`（format `date-time`）query 参数。

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
  "upstream_path": "/api/v1/Bills",
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
  "upstream_path": "/api/v1/Bills",
  "retrieved_at": "ISO-8601"
}
```

状态码：

- 参数错误：`400`
- 上游超时：`504`
- 上游网络错误：`502`
- 上游返回非 2xx：透传原始状态码，并用 `UPSTREAM_ERROR`
- 未知内部错误：`500`

### 4.6 响应模型处理规则（必须实现）

该 swagger 在 `components.schemas` 定义了大量对象与 enum（Bill/Stage/Publication/Amendment 等），实现必须遵循：

1. 运行时不强制将响应反序列化为固定 TS 结构，保留上游原始 JSON。
2. endpoint 与参数行为严格按 `paths` 定义执行。
3. README 标注“响应结构以实际上游返回为准”。
4. 对 RSS 路径返回的非 JSON 内容，`data` 保留原始 text。

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
- 参数为 number 时使用 `z.coerce.number()`。
- enum 参数必须使用 `z.enum([...])` 或等价严格枚举约束。

### 5.3 handler 输出规则

- 成功：
  - `content: [{ type: 'text', text: JSON.stringify(result) }]`
  - `structuredContent: result`
- 失败：
  - 不抛未处理异常；统一映射为错误信封返回 `content + structuredContent`

---

## 6. 入口规范

### 6.1 stdio 入口（`src/index.ts`）

- 启动 MCP Server（name/version 从 `package.json` 读取或常量定义）。
- 调用 `registerAllTools(server, runtime)` 注册工具。
- 使用 MCP stdio transport 启动服务。

### 6.2 HTTP 入口（`src/http.ts`）

- 监听 `process.env.UKP_HTTP_PORT ?? 3000`。
- `GET /healthz` 返回 `{ status: 'ok' }`。
- `ALL /proxy/*`：
  - 从请求 path 解析并匹配 endpoint；
  - 合并 path/query 参数后调用统一 runtime；
  - 返回 JSON 信封；
  - endpoint 不匹配返回 404。

---

## 7. package.json 脚本要求

必须包含且可运行：

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsx src/index.ts",
    "dev:http": "tsx src/http.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "lint": "tsc --noEmit",
    "check": "pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run build",
    "check:tarball:shebang": "pnpm run build && node scripts/add-shebang.mjs && node scripts/verify-tarball-shebang.mjs"
  }
}
```

---

## 8. 测试规范（最小覆盖）

### 8.1 `test/endpoints.generated.test.ts`

- 断言 endpoint 数量为 21。
- 断言每个 endpoint 的 `path/method/toolName` 稳定且唯一。
- 断言关键 enum 参数在 metadata 中正确展开（如 `Decision`、`CurrentHouse`、`SortOrder`）。

### 8.2 `test/tools.generated.test.ts`

- 断言注册工具数量与 endpoint 一致（21）。
- 断言 path 参数在 inputSchema 中为必填。
- 断言 enum 参数在 schema 中可观察（JSON schema 或 parse 行为）。
- 断言非法 enum 输入映射为 `INVALID_PARAMS` + 400。

### 8.3 `test/http.proxy.test.ts`

- `/healthz` 返回 200。
- 未匹配 endpoint 返回 404。
- path 参数映射正确（示例：`/proxy/api/v1/Bills/1`、`/proxy/api/v1/Rss/Bills/1.rss`）。
- query 参数透传正确（示例：`Skip/Take/SearchTerm/SortOrder`）。
- 上游超时映射 504；网络错误映射 502。

---

## 9. README 要求

`servers/uk-parliament-bills/README.md` 至少包含：

1. 项目简介（对应 Bills API）。
2. 安装与构建命令。
3. stdio 与 HTTP 两种运行方式。
4. 环境变量（`UPSTREAM_BASE_URL`、`REQUEST_TIMEOUT_MS`、`UKP_HTTP_PORT`）。
5. 工具清单（21 个）及简要说明。
6. 错误信封示例。

---

## 10. 交付验收（DoD）

同时满足以下条件才算完成：

1. endpoint 覆盖完整：swagger 的 21 个 GET 全部映射为 MCP tools。
2. toolName 稳定且唯一，测试中有断言。
3. enum 约束（`AmendmentDecisionSearch`/`BillTypeCategory`/`House`/`OriginatingHouse`/`BillSortOrder`）落地到 endpoint metadata + inputSchema。
4. stdio 与 HTTP 两入口都可运行。
5. 错误映射符合本规格第 4.5 节。
6. `pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run check` 通过。
7. `check:tarball:shebang` 通过（bin 产物具备 shebang）。

---

## 11. 执行命令（最终必须跑）

```bash
pnpm install
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run check
pnpm --filter @darkhorseone/mcp-server-uk-parliament-bills run check:tarball:shebang
pnpm run check
```

---

## 12. 参考输入

- 规范指南：`docs/guide.md`
- API 描述：`docs/impl/uk-parliament-bills/swagger.json`
- OpenAPI 信息：`Bills API` / version `v1`
