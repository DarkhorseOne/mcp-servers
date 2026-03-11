# UK Parliament Committees MCP Server 技术规格

> 目标：仅基于本文件 + `swagger.json`，一次性完成可运行的 MCP server 实现（代码、测试、构建、文档）。

---

## 0. 一口气执行入口（必须按顺序）
### 0.1 输入与变量

```bash
SERVER_SLUG="uk-parliament-committees"
PACKAGE_NAME="@darkhorseone/mcp-server-${SERVER_SLUG}"
PACKAGE_DIR="servers/${SERVER_SLUG}"
IMPL_DIR="docs/impl/uk-parliament-committees"
SWAGGER_PATH="${IMPL_DIR}/swagger.json"
UKPCOM_API_BASE_URL="https://committees-api.parliament.uk"
UKPCOM_REQUEST_TIMEOUT_MS="10000"
UKPCOM_HTTP_PORT="8787"
```

### 0.2 产物文件清单（必须完整）

在 `${PACKAGE_DIR}` 生成并维护：

- `package.json`
- `tsconfig.json`
- `README.md`
- `src/index.ts`（stdio MCP 入口）
- `src/http.ts`（HTTP proxy 入口）
- `src/core.ts`（参数解析、上游调用、错误映射）
- `src/endpoints.generated.ts`（swagger → endpoint registry）
- `src/tools.generated.ts`（工具注册 + input schema）
- `test/endpoints.generated.test.ts`
- `test/tools.generated.test.ts`
- `test/http.proxy.test.ts`

### 0.3 端到端步骤（严格顺序）

1. 读取 `${SWAGGER_PATH}`，提取 `paths[*].get` 全量 endpoint（本规格应为 **38** 个）。
2. 生成 `src/endpoints.generated.ts`：包含 path/method/toolName/summary/params，并写入参数 `description` 与 `enum`（若 swagger 提供或可解析）。
3. 生成 `src/core.ts`：参数校验与类型转换、上游请求、统一成功/错误信封、状态码映射。
4. 生成 `src/tools.generated.ts`：逐 endpoint 注册 MCP tool，构建 `inputSchema`（含 description/enum）。
5. 生成 `src/index.ts`（stdio）与 `src/http.ts`（`/healthz` + `/proxy/*`）。
6. 编写并通过最小测试集：endpoint 覆盖、schema 映射、proxy 行为、错误映射。
7. 执行 typecheck/build/test，按本文 DoD 逐条验收。

---

## 1. 设计目标（必须同时满足）

1. **stdio MCP Server（默认）**：将 Committees Swagger 的全部 GET 接口映射为 MCP tools。
2. **HTTP Proxy Server（扩展）**：共享 endpoint registry 与参数规则，提供 `/proxy/*` 调试与集成能力。
3. **参数映射稳定**：同一 swagger 多次生成结果一致（toolName、参数类型、description/enum）。
4. **错误行为标准化**：参数错误、超时、网络错误、上游错误输出一致信封。

---

## 2. 约束与命名

### 2.1 package 命名

- 规则：`@darkhorseone/mcp-server-<slug>`
- 本项目：`@darkhorseone/mcp-server-uk-parliament-committees`

### 2.2 运行协议

- 默认：`stdio`
- 扩展：`http`

### 2.3 技术栈

- TypeScript（strict，NodeNext）
- Node ESM（`type: module`）
- `@modelcontextprotocol/sdk`
- `zod`
- `vitest`
- `tsup`

### 2.4 环境变量

- `UKPCOM_API_BASE_URL`（默认：`https://committees-api.parliament.uk`，完整 https 根地址，不含尾部 `/api`）
- `UKPCOM_REQUEST_TIMEOUT_MS`（默认 `10000`）
- `UKPCOM_HTTP_PORT`（HTTP 模式默认 `8787`）

> 说明：swagger 未提供 `servers` 字段，因此 base URL 必须由环境变量显式指定。

### 2.5 上游 API 基线

- swagger 未定义 `servers` 字段，因此 `UKPCOM_API_BASE_URL` 通过环境变量覆盖默认值。
- `UKPCOM_API_BASE_URL` 为完整 https 根地址（不含尾部 `/api`）。
- 默认超时：`UKPCOM_REQUEST_TIMEOUT_MS=10000`。
- swagger 仅提供 `info.contact.url=https://www.parliament.uk`，不视为 API Base URL。

---

## 3. Swagger → Endpoint/Tool 映射规范

### 3.1 Endpoint 范围（本 swagger 的 38 个 GET）

1. `GET /api/BillPetitions`
2. `GET /api/BillPetitions/{id}`
3. `GET /api/BillPetitions/{id}/Document/{fileDataFormat}`
4. `GET /api/Broadcast/Meetings`
5. `GET /api/CommitteeBusiness`
6. `GET /api/CommitteeBusiness/{id}`
7. `GET /api/CommitteeBusiness/{id}/Publications/Summary`
8. `GET /api/CommitteeBusinessType`
9. `GET /api/CommitteeType`
10. `GET /api/Committees`
11. `GET /api/Committees/NextEvent`
12. `GET /api/Committees/{id}`
13. `GET /api/Committees/{id}/Events`
14. `GET /api/Committees/{id}/Members`
15. `GET /api/Committees/{id}/Members/{personId}`
16. `GET /api/Committees/{id}/Staff`
17. `GET /api/Committees/{id}/Publications/Summary`
18. `GET /api/Committees/{id}/ArchivedPublicationLinks`
19. `GET /api/Countries`
20. `GET /api/Events`
21. `GET /api/Events/Activities`
22. `GET /api/Events/{id}`
23. `GET /api/Events/{id}/Attendance`
24. `GET /api/Events/{id}/Activities`
25. `GET /api/Members`
26. `GET /api/Messaging/Banners/{location}`
27. `GET /api/OralEvidence`
28. `GET /api/OralEvidence/{id}`
29. `GET /api/OralEvidence/{id}/Document/{fileDataFormat}`
30. `GET /api/PublicationType`
31. `GET /api/Publications`
32. `GET /api/Publications/{id}`
33. `GET /api/Publications/{id}/Document/{documentId}/{fileDataFormat}`
34. `GET /api/SubmissionPeriodTemplate/{id}/Document/{documentId}`
35. `GET /api/SubmissionPeriod/{id}`
36. `GET /api/WrittenEvidence`
37. `GET /api/WrittenEvidence/{id}`
38. `GET /api/WrittenEvidence/{id}/Document/{fileDataFormat}`

### 3.2 参数类型映射

- `type: string` → `string`
- `type: integer|number` → `number`
- `type: boolean` → `boolean`
- `type: array` + `items.integer|number` → `array:number`
- `type: array` + `items.string` → `array:string`
- schema `$ref` 指向 enum 时，基础类型按 `string` 处理并附带 `enum` 值列表。

### 3.3 required/optional 规则

- `required: true` 参数为必填。
- 未标注或 `required: false` 的参数为可选。
- path 参数必须始终出现在输入 schema 中（且必填）。

### 3.4 description/enum 提取规则

- `description` 来源：`paths.<path>.get.parameters[*].description`。
- `description` 非空才落库到 endpoint metadata。
- `enum` 来源：参数 schema 的 `enum`，或 `$ref` 到 enum schema 后解析出的值。

### 3.5 toolName 生成规则（稳定且唯一）

- 首选：使用 swagger `operationId` 作为语义来源。
- 规则：`snake_case(operationId)`，并确保全局唯一。
- 如存在重复（例如 `operationId: "Get"`），在工具名后追加路径语义后缀（如 `get_broadcast_meetings`）。

### 3.6 MCP 工具输入参数规范（按参数类别）

- **通用分页**：`Skip`/`Take` → `number`（query）
- **筛选查询**：`SearchTerm` → `string`（query，含 minLength 约束不在 runtime 强制，但保留 description）
- **日期**：`StartDate`/`EndDate`/`DateFrom`/`DateTo`/`StartDateFrom`/`StartDateTo`/`EndDateFrom` → `string`（format `date-time`）
- **布尔**：`ShowOnWebsiteOnly`/`IncludeEventAttendees`/`IncludeActivityAttendees`/`GroupChildEventsWithParent`/`SortAscending`/`ExcludeCancelledEvents`/`EventWithActivitiesOnly` → `boolean`
- **枚举**：
  - `CommitteeStatus`, `CommitteeCategory`, `House`, `CommitteeBusinessStatus`, `CommitteeBusinessQuerySortOrder`, `PublicationQuerySortOrder`, `MembershipStatus`, `FileDataFormat`, `BannerLocation` 等，必须解析 enum 并写入 inputSchema。

---

## 4. Runtime 规范（core.ts）

### 4.1 参数解析

- `number`：接受 number 或可转换的数字字符串。
- `boolean`：接受 boolean 或字符串 `true|false|1|0`（大小写不敏感）。
- `string`：必须为非空字符串（仅对 required 参数校验非空）。
- `array:number`：接受数组或逗号分隔字符串，逐项按 number 解析。
- `array:string`：接受数组或逗号分隔字符串，逐项按 string 解析。

### 4.2 required 校验

- 对 `required: true` 参数，`undefined | null | ''` 一律报错。
- 抛出 `EndpointValidationError`，包含 `paramName`, `location`, `reason`。

### 4.3 Upstream 调用

- 目标 URL：`${UKPCOM_API_BASE_URL}${endpoint.path}`
- 默认超时：`UKPCOM_REQUEST_TIMEOUT_MS`（默认 `10000`）
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
- 参数 `description` 写入 schema `describe(...)`。
- 参数 `enum` 存在时，构建 literal union 约束。

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
  - 使用 `matchEndpointByResolvedPath` 匹配 endpoint
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
    "inspect:npm": "npx -y @modelcontextprotocol/inspector npx -y @darkhorseone/mcp-server-uk-parliament-committees"
  }
}
```

---

## 8. 测试规范（最小覆盖）

### 8.1 endpoints.generated.test.ts

- endpoint 数量与 swagger 一致（**38**）。
- `toolName` 唯一。
- `path` 唯一。

### 8.2 http.proxy.test.ts

- path 参数 + query 参数拼接正确。
- array query 生成重复键（如 `ids=1&ids=2`）。
- required 参数缺失时报错。

### 8.3 tools.generated.test.ts

- 注册工具数量等于 endpoint 数。
- upstream timeout 映射到 `UPSTREAM_TIMEOUT` + 504。
- 参数 `description` 与 `enum` 能出现在工具 input schema 元信息。

---

## 9. README 要求（package 内独立 README）

`servers/<slug>/README.md` 至少包含：

- 包名与用途
- 环境变量（尤其 `UKPCOM_API_BASE_URL`）
- 安装、构建、运行（stdio/http）
- healthz 与 proxy 示例
- Inspector 使用方式
- 包级 test/typecheck/build 命令

---

## 10. 交付验收（DoD）

以下全部满足才算完成：

1. 从 swagger `paths[*].get` 全量生成 endpoints（本例 38）。
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
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run build
```

---

## 12. 参考输入

- `docs/impl/uk-parliament-committees/swagger.json`
- `https://www.parliament.uk/`（仅 contact URL，非 API Base URL）
