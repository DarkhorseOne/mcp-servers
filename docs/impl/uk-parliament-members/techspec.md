# UK Parliament Members MCP Server 技术规格（全量 Endpoint）

## 0. Codex 一口气执行入口（先做这个）

本节是给 Codex 的**直接执行指令**，目标是：读取本技术规格后，不再二次澄清，直接完成开发。

### 0.1 变量约定（可复用到后续几十个 MCP Server）

```bash
SERVER_SLUG="uk-parliament-members"
PACKAGE_NAME="@darkhorseone/mcp-server-${SERVER_SLUG}"
PACKAGE_DIR="servers/${SERVER_SLUG}"
```

批量复用时，只替换 `SERVER_SLUG`，其余命名规则保持不变。

### 0.2 创建下级项目（不依赖额外脚手架）

```bash
mkdir -p "${PACKAGE_DIR}/src"
mkdir -p "${PACKAGE_DIR}/test"
```

在 `${PACKAGE_DIR}` 下创建并完善以下文件（可由 Codex直接写入）：

- `package.json`（name 必须等于 `${PACKAGE_NAME}`）
- `tsconfig.json`
- `src/index.ts`（stdio MCP 默认入口）
- `src/http.ts`（HTTP 转发入口）
- `src/endpoints.generated.ts`（由 swagger 生成或静态产物化）
- `src/tools.generated.ts`（43 endpoints 对应 MCP tools）
- `test/*.test.ts`（至少覆盖 endpoints 注册、参数透传、错误映射）

### 0.3 Codex 端到端执行顺序（必须按序完成）

1. 读取 `docs/impl/uk-parliament-members/swagger.json`，提取全部 endpoints（43 个）；
2. 生成 endpoint registry（path、method、path params、query params、required）；
3. 生成 stdio MCP tools（一 endpoint 一 tool，全部可调用）；
4. 实现 HTTP proxy server（同一 registry 驱动，完成转发）；
5. 增加本地 Inspector 调试脚本（dist + npm 发布包）；
6. 运行 `pnpm run check`，修复问题直到通过；
7. 对照本文“验收标准”逐项自检，全部满足后结束。

### 0.4 产出定义（DoD）

只要出现以下任一项未满足，任务视为未完成：

- 43 个 endpoint 有遗漏；
- stdio 不是默认可运行入口；
- HTTP 未实现完整转发；
- package 命名不符合规则；
- Inspector 命令不可直接执行。

## 1. 目标（仅两件事，必须同时实现）

本 MCP Server 必须完成以下两项能力：

1. **stdio MCP 能力（默认）**  
   将 `swagger.json` 中描述的 **全部 API endpoints（43 个）** 转化为本地可调用的 MCP tools（通过 stdio 协议提供）。

2. **HTTP 包装与转发能力（扩展）**  
   基于同一份 endpoint 元数据，提供一个简单 HTTP server，完成对上游 UK Parliament API 的包装与转发，使 unla 等中间件可通过 HTTP 协议配置并提供 MCP server 能力。

---

## 2. 命名与协议约束

### 2.1 Package 命名规则

统一规则：`@darkhorseone/mcp-server-<路径名>`  
本项目路径名：`uk-parliament-members`  
故 package 名称必须为：

`@darkhorseone/mcp-server-uk-parliament-members`

### 2.2 传输协议

- **默认协议**：`stdio`（必须可直接运行）
- **扩展协议**：`http`（提供 HTTP 转发层，供 unla 等工具接入）

---

## 3. 输入文档与上游

- Swagger 输入：`docs/impl/uk-parliament-members/swagger.json`
- OpenAPI 版本：`3.0.4`
- 上游基地址：`https://members-api.parliament.uk`

说明：

- 路径定义以 swagger 为唯一真值来源；
- 本地服务只做协议转换、参数透传（带必要校验）与响应标准化，不改变上游业务语义。

---

## 4. 全量 Endpoint 覆盖清单（43）

以下 endpoints 必须全部支持（均为 `GET`）：

1. `/api/Location/Browse/{locationType}/{locationName}`
2. `/api/Location/Constituency/Search`
3. `/api/Location/Constituency/{id}`
4. `/api/Location/Constituency/{id}/Synopsis`
5. `/api/Location/Constituency/{id}/Representations`
6. `/api/Location/Constituency/{id}/Geometry`
7. `/api/Location/Constituency/{id}/ElectionResults`
8. `/api/Location/Constituency/{id}/ElectionResult/{electionId}`
9. `/api/Location/Constituency/{id}/ElectionResult/Latest`
10. `/api/LordsInterests/Register`
11. `/api/LordsInterests/Staff`
12. `/api/Members/Search`
13. `/api/Members/SearchHistorical`
14. `/api/Members/{id}`
15. `/api/Members/{id}/Biography`
16. `/api/Members/{id}/Contact`
17. `/api/Members/{id}/ContributionSummary`
18. `/api/Members/{id}/Edms`
19. `/api/Members/{id}/Experience`
20. `/api/Members/{id}/Focus`
21. `/api/Members/History`
22. `/api/Members/{id}/LatestElectionResult`
23. `/api/Members/{id}/Portrait`
24. `/api/Members/{id}/PortraitUrl`
25. `/api/Members/{id}/RegisteredInterests`
26. `/api/Members/{id}/Staff`
27. `/api/Members/{id}/Synopsis`
28. `/api/Members/{id}/Thumbnail`
29. `/api/Members/{id}/ThumbnailUrl`
30. `/api/Members/{id}/Voting`
31. `/api/Members/{id}/WrittenQuestions`
32. `/api/Parties/StateOfTheParties/{house}/{forDate}`
33. `/api/Parties/LordsByType/{forDate}`
34. `/api/Parties/GetActive/{house}`
35. `/api/Posts/GovernmentPosts`
36. `/api/Posts/OppositionPosts`
37. `/api/Posts/Spokespersons`
38. `/api/Posts/Departments/{type}`
39. `/api/Posts/SpeakerAndDeputies/{forDate}`
40. `/api/Reference/PolicyInterests`
41. `/api/Reference/Departments`
42. `/api/Reference/AnsweringBodies`
43. `/api/Reference/Departments/{id}/Logo`

---

## 5. stdio MCP 设计（全量工具化）

### 5.1 工具生成原则

基于 swagger path 自动生成 tool 定义（或在构建时产物化），每个 endpoint 对应一个 MCP tool：

- tool 命名建议：
  - `ukp_location_browse`
  - `ukp_members_search`
  - `ukp_members_get_by_id`
  - `ukp_reference_departments_logo` 等
- path 参数与 query 参数按 swagger 原始参数名映射；
- 输入 schema 从 OpenAPI 参数定义派生，保留 required/optional 语义；
- 输出统一为 JSON 对象，至少包含：
  - `status`
  - `data`（上游响应体）
  - `upstream_path`
  - `retrieved_at`

### 5.2 stdio 默认启动

- CLI 默认入口即 stdio server；
- server 启动后注册全部 43 个 tools；
- 对外行为遵循 MCP 标准请求/响应格式。

---

## 6. HTTP 包装与转发设计

### 6.1 目标

HTTP server 用于“配置化转发 swagger endpoints”，使 unla 这类系统无需 stdio，即可通过 HTTP 方式对接同一能力集。

### 6.2 转发行为

- 路由建议：
  - `GET /healthz`：健康检查
  - `ALL /proxy/*`：统一转发入口（或按 endpoint 显式挂载 43 个路由）
- 转发时：
  - 校验 path/query 参数；
  - 拼接上游 URL（`https://members-api.parliament.uk` + swagger path）；
  - 透传 query；
  - 返回标准 JSON 包装（含上游状态码和正文）。

### 6.3 与 MCP 的关系

- stdio 是主 MCP server；
- HTTP 包装层可被中间件（如 unla）读取和配置，再由中间件以 HTTP 协议对外提供 MCP 能力；
- 两者共享同一份 endpoint registry，确保能力一致。

---

## 7. 运行与配置

建议环境变量：

- `UKP_API_BASE_URL`（默认 `https://members-api.parliament.uk`）
- `UKP_HTTP_PORT`（默认 `8787`）
- `UKP_REQUEST_TIMEOUT_MS`（默认 `10000`）

---

## 8. 错误处理

- 参数错误：`400` + 可读错误消息；
- 上游超时：`504` 或统一 error 对象（实现需一致）；
- 上游非 2xx：保留上游 status，并返回结构化错误；
- 所有错误输出必须可被调用方稳定解析（字段固定）。

---

## 9. 本地测试（MCP Inspector）

使用官方工具：`npx @modelcontextprotocol/inspector`。

### 9.1 package.json 脚本要求

必须在 `package.json` 提供两类测试命令：

1. **测试本地构建产物（dist）**
   - 通过 Inspector 启动本地 dist server；
   - 用于本地开发联调。

2. **测试 npm registry 已发布包**
   - 通过 Inspector 启动 `@darkhorseone/mcp-server-uk-parliament-members`；
   - 用于验证已发布版本行为。

---

## 10. 验收标准

1. 覆盖 swagger 中全部 43 个 endpoints；
2. stdio 模式可列出并调用全部对应 MCP tools；
3. HTTP 模式可对全部 endpoints 完成转发；
4. package 名称符合 `@darkhorseone/mcp-server-<路径名>` 规则；
5. `package.json` 已提供 Inspector 的本地 dist 与 npm 包两套测试命令；
6. 文档与实现在 endpoint 清单上保持一致（禁止遗漏）。

---

## 11. 参考

- `docs/impl/uk-parliament-members/swagger.json`
- `https://members-api.parliament.uk/api`
- `https://www.npmjs.com/package/@modelcontextprotocol/inspector`
