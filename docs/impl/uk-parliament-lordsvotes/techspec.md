# UK Parliament Lords Votes MCP Server 技术规格

> 目标：仅基于本文件与 `docs/impl/uk-parliament-lordsvotes/swagger.json`，可一次性完成 server 实现、测试与验收。

## 0. 一口气执行入口

### 0.1 输入与变量

- `IMPL_DIR=docs/impl/uk-parliament-lordsvotes`
- `SWAGGER_PATH=docs/impl/uk-parliament-lordsvotes/swagger.json`
- `SERVER_SLUG=uk-parliament-lordsvotes`
- `PKG_NAME=@darkhorseone/mcp-server-uk-parliament-lordsvotes`
- `UPSTREAM_BASE_URL=https://lordsvotes-api.parliament.uk`
  - 说明：OpenAPI 未显式给出 `servers` 字段，运行时以环境变量注入为准。
- `UPSTREAM_TIMEOUT_MS`（默认 `10000`）
- `USER_AGENT`（默认 `${PKG_NAME}/0.1.0`）

### 0.2 产物文件清单

最小实现产物（位于 `servers/uk-parliament-lordsvotes/`）：

1. `package.json`
2. `tsconfig.json`
3. `src/index.ts`（stdio 入口）
4. `src/http.ts`（可选 http 入口，建议保留）
5. `src/config.ts`（env 解析）
6. `src/client.ts`（上游 API client）
7. `src/tools/definitions.ts`（tool schema）
8. `src/tools/handlers.ts`（tool handlers）
9. `src/types.ts`（基于 swagger 的核心类型）
10. `src/errors.ts`（错误信封与状态码映射）
11. `test/tools.spec.ts`（工具级单测）
12. `test/client.spec.ts`（client 层单测）
13. `README.md`

### 0.3 端到端步骤（严格顺序）

1. 读取 `swagger.json`，冻结 endpoint 与参数映射（本文件第 3 节）。
2. 初始化 package 与 TypeScript（NodeNext + strict，继承仓库基础配置）。
3. 实现配置层：解析 `UPSTREAM_BASE_URL`、`UPSTREAM_TIMEOUT_MS`、`USER_AGENT`。
4. 实现 API client：统一 query/path 构造、超时控制、错误归一化。
5. 定义 MCP tools（名称、description、inputSchema）并实现 handler。
6. 实现 stdio 入口并注册全部 tools；可选实现 http 入口。
7. 编写测试：参数映射、成功响应、错误映射、枚举校验。
8. 完善 README（环境变量、tool 列表、示例输入输出）。
9. 执行 lint/typecheck/test/build/check，全部通过后交付。

## 1. 设计目标（必须同时满足）

1. **完整覆盖 swagger 中 5 个 GET endpoints**，一一映射为 MCP tools。
2. **参数行为可预测**：path/query 参数命名、必填规则、默认值与 swagger 一致。
3. **错误语义稳定**：`400/404/503/网络超时` 在 MCP 层有统一错误结构。
4. **输出可消费**：handler 返回结构化 JSON（不丢字段，不改语义）。
5. **可验证交付**：测试与最终命令可直接证明实现正确。

## 2. 约束与命名

- package 命名：`@darkhorseone/mcp-server-uk-parliament-lordsvotes`
- 目录命名：`servers/uk-parliament-lordsvotes`
- 运行协议：
  - **必须**支持 `stdio`
  - `http` 为可选扩展入口（不影响 DoD）
- 技术栈：TypeScript + Node.js（ESM/NodeNext）
- 类型安全：禁止 `as any`、`@ts-ignore`、`@ts-expect-error`
- 传输格式：上游优先请求 `application/json`

## 3. 需求源 → Endpoint/Tool 映射规范

### 3.1 Tool 命名规则

固定使用 snake_case，按 endpoint 语义命名：

1. `get_division_by_id` → `GET /data/Divisions/{divisionId}`
2. `search_divisions_total_results` → `GET /data/Divisions/searchTotalResults`
3. `search_divisions` → `GET /data/Divisions/search`
4. `get_member_voting_records` → `GET /data/Divisions/membervoting`
5. `get_divisions_grouped_by_party` → `GET /data/Divisions/groupedbyparty`

### 3.2 参数类型映射规则

- `integer(int32)` → `number`（要求为整数）
- `boolean` → `boolean`
- `string(date-time)` → `string`（ISO-8601；不在 client 层重写时区）
- `string(enum)`（`Comparators`）→ 字面量枚举：
  - `LessThan`
  - `LessThanOrEqualTo`
  - `EqualTo`
  - `GreaterThanOrEqualTo`
  - `GreaterThan`

### 3.3 必填/可选与默认值规则

- `divisionId`：必填（path）
- `MemberId`（仅 `membervoting`）：必填（query，最小值 `1`）
- 其他 query 参数默认可选
- `skip`：默认 `0`（仅 `search`、`membervoting`）
- `take`：默认 `25`（仅 `search`、`membervoting`）

### 3.4 参数命名规范（MCP 输入）

MCP tool 输入使用 `camelCase`，上游请求保持 swagger 原始 query key：

- `searchTerm` → `SearchTerm`
- `memberId` → `MemberId`
- `includeWhenMemberWasTeller` → `IncludeWhenMemberWasTeller`
- `startDate` → `StartDate`
- `endDate` → `EndDate`
- `divisionNumber` → `DivisionNumber`
- `totalVotesCastComparator` → `TotalVotesCast.Comparator`
- `totalVotesCastValueToCompare` → `TotalVotesCast.ValueToCompare`
- `majorityComparator` → `Majority.Comparator`
- `majorityValueToCompare` → `Majority.ValueToCompare`
- `skip` → `skip`
- `take` → `take`

## 4. Runtime 规范

### 4.1 参数解析与校验

1. path 参数必须在 handler 层先校验（空值/非整数直接拒绝）。
2. 对 `skip/take` 应用默认值后再发起上游请求。
3. 对 `Comparators` 进行枚举校验，非法值返回 `INVALID_ARGUMENT`。
4. `membervoting.memberId` 必须 `>=1`。

### 4.2 Upstream 调用

- HTTP 方法：全部 `GET`
- 请求头至少包含：
  - `Accept: application/json`
  - `User-Agent: <USER_AGENT>`
- 超时：`AbortController` + `UPSTREAM_TIMEOUT_MS`

### 4.3 成功返回规范

tool handler 返回统一对象：

```json
{
  "ok": true,
  "endpoint": "/data/...",
  "status": 200,
  "data": "<上游 JSON 原样结构>"
}
```

### 4.4 错误信封与状态码映射

统一错误结构：

```json
{
  "ok": false,
  "endpoint": "/data/...",
  "status": 400,
  "code": "INVALID_ARGUMENT",
  "message": "A parameter was not valid",
  "details": {"upstreamStatus": 400}
}
```

状态码映射：

- `400` → `INVALID_ARGUMENT`
- `404` → `NOT_FOUND`
- `503` → `UNAVAILABLE`
- 超时/网络错误 → `UPSTREAM_TIMEOUT` / `UPSTREAM_NETWORK_ERROR`
- 其他非 2xx → `UPSTREAM_ERROR`

## 5. MCP Tool 规范

### 5.1 注册规则

- server 启动时一次性注册全部 5 个 tools。
- tool `description` 取自 swagger `summary/description` 组合。

### 5.2 inputSchema 规则

- 每个 tool 的 schema 必须显式 `type: object`。
- `required` 仅包含 swagger 明确 required 字段。
- 对 `Comparators` 参数必须填充 `enum`。
- `skip/take` 必须带 `default`。
- 每个字段尽量携带 swagger `description`（若存在）。

### 5.3 handler 输出规则

- 输出统一采用第 4.3/4.4 节定义的成功/失败信封。
- 不允许吞错；必须返回可诊断 message 与 code。
- 不对上游 `data` 字段做字段改名或裁剪。

## 6. 入口规范

### 6.1 stdio（必须）

- 文件：`src/index.ts`
- 职责：初始化配置、构建 client、注册 tools、启动 MCP stdio transport。

### 6.2 http（可选）

- 文件：`src/http.ts`
- 若实现，应复用同一套 tool handler，不得复制业务逻辑。

## 7. package.json 脚本要求

最小脚本集：

- `dev`: `tsx src/index.ts`
- `build`: `tsup src/index.ts src/http.ts --format esm --dts`
- `typecheck`: `tsc -p tsconfig.json --noEmit`
- `test`: `vitest run`
- `lint`: （按仓库约定接入）

## 8. 测试规范（最小覆盖）

必须覆盖以下用例：

1. `get_division_by_id`
   - divisionId 合法时返回 `ok=true`
   - divisionId 非法时本地校验失败（不调用上游）
2. `search_divisions_total_results`
   - 混合筛选参数可正确映射到 query（含点号键）
3. `search_divisions`
   - `skip/take` 默认值注入正确
4. `get_member_voting_records`
   - 缺少 `memberId` 报错
   - `memberId < 1` 报错
5. `get_divisions_grouped_by_party`
   - `Comparators` 枚举非法值报错
6. 错误映射
   - 400/404/503 分别映射到预期 code
   - 超时映射 `UPSTREAM_TIMEOUT`

## 9. README 要求

README 必须包含：

1. 项目简介与上游 API 来源（UK Parliament Lords Votes API）
2. 环境变量说明（`UPSTREAM_BASE_URL`、`UPSTREAM_TIMEOUT_MS`、`USER_AGENT`）
3. 全部 tool 列表及参数表
4. 本地运行与测试命令
5. 错误码说明与示例

## 10. 交付验收（DoD）

满足以下全部条件才算完成：

1. 5 个 swagger endpoints 已全部映射为 MCP tools。
2. 参数映射、默认值、required、enum 行为与本 spec 一致。
3. 测试通过且覆盖第 8 节最小用例。
4. `lint`、`typecheck`、`test`、`build` 全通过。
5. README 完整可用。

## 11. 执行命令（最终必须跑）

在仓库根目录执行：

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run lint
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run typecheck
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run test
pnpm --filter @darkhorseone/mcp-server-uk-parliament-lordsvotes run build
pnpm run check
```

## 12. 参考输入

- Guide：`docs/guide.md`
- OpenAPI：`docs/impl/uk-parliament-lordsvotes/swagger.json`
