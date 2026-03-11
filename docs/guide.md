# MCP Impl TechSpec 生成指南（Guide）

> 适用目标：当你只提供 `docs/tools/<tool>.md`（例如 `docs/tools/search_stops.md`）时，让智能编码代理可以稳定产出 `docs/impl/<server-slug>/techspec.md`，并据此一口气实现 MCP server。

---

## 1. 为什么有这个 Guide

`docs/impl/uk-parliament-members/techspec.md` 已经证明：

- 只要规格写到“可执行级别”（输入、产物、步骤、验收、命令），
- 代理就能从“需求理解”直接走到“实现 + 测试 + 可运行”闭环，
- 并显著降低反复沟通和返工。

本指南把这个经验沉淀成可复用方法，供后续任何工具需求复刻。

---

## 2. `uk-parliament-members/techspec.md` 的形成过程（回顾）

该文档不是先拍脑袋写出来，而是按“**已实现代码反向收敛**”形成：

1. **先有可运行实现**（stdio + http + tests + build）。
2. **回读真实代码与测试行为**，提取不可缺失的约束（参数映射、错误信封、schema 输出、命令入口）。
3. **把隐式规则显式化**：
   - 输入变量
   - 产物文件清单
   - 端到端执行顺序
   - DoD 与最终验证命令
4. **把“建议”升级为“必须”**（MUST）并提供可验证标准。

核心经验：**techspec 要描述“如何交付成功”，而不只是“想做什么”。**

---

## 3. 后续指导开发的作用（为什么它有效）

高质量 impl techspec 在开发中承担 4 个角色：

1. **执行蓝图**：代理按顺序实现，不跳步。
2. **一致性约束**：命名、接口、错误、测试口径一致。
3. **验收契约**：完成标准前置，不再靠主观判断“差不多”。
4. **跨会话记忆**：新开项目/新会话仅靠 techspec + 需求源仍可复现。

---

## 4. 标准使用方式（你指定的后续流程）

后续统一按以下方式执行：

1. 选择一个需求说明文件（位于 `docs/tools/*.md`）。
2. **必须同时读取**：
   - `docs/guide.md`（本指南）
   - `docs/tools/<selected>.md`（选定需求）
3. 产出对应的 impl 技术规格：
   - `docs/impl/<server-slug>/techspec.md`

> 你的流程约定（固定）：
> “读取并根据 `docs/guide.md` 的指南和 `docs/tools/search_stops.md`，写一份对应的 impl techspec。”

### 4.1 改造后的快捷条件（推荐）

当需求侧已经给出：

- `impl` 目标路径（例如：`docs/impl/<server-slug>/`）
- `swagger.json` 路径（例如：`docs/impl/<server-slug>/swagger.json`）

则**无需再猜测 server 边界**，直接按以下契约生成：

1. 输入：`IMPL_DIR` + `SWAGGER_PATH`
2. 输出：`IMPL_DIR/techspec.md`
3. 约束：techspec 必须覆盖 swagger 的 endpoint/parameter 映射、runtime、测试与 DoD

> 这条快捷条件的目的：把“选题+定边界”的时间压缩为 0，直接进入可执行规格产出。

---

## 5. 从 `docs/tools/*.md` 到 impl techspec 的转换算法（SOP）

### Step A — 提取需求源的结构化信息

从 `docs/tools/<tool>.md` 提取并标准化：

- Tool 基本信息：`tool name`、用途
- Upstream API：`base URL`、`endpoint`、`method`
- 输入参数：必填/可选、类型、默认值、来源（env/query/path）
- 鉴权方式：header/query/api key/oauth
- 超时与重试策略（若需求源有）
- 错误处理与响应映射规则
- 官方文档链接

### Step B — 决定 server 边界

根据单个或多个 tool 需求，确定：

- `server-slug`
- package name（`@darkhorseone/mcp-server-<slug>`）
- 入口模式：stdio 必选，http 可选（建议保留扩展位）

> 若已提供 `IMPL_DIR` 与 `SWAGGER_PATH`，Step B 直接使用输入，不再重新推导。

### Step C — 落地为“可执行”章节

techspec 必须包含并写实：

1. 一口气执行入口（输入变量、产物清单、严格步骤）
2. 数据模型与参数映射规则
3. runtime 行为（解析、校验、请求、错误映射）
4. MCP tool schema 映射
5. 入口与脚本规范
6. 测试规范
7. DoD
8. 最终验证命令

### Step D — 写成“可验证语句”

每条规则尽量满足：

- 可观察（能在代码/输出中看到）
- 可测试（有测试或命令可验证）
- 可判定（通过/失败二值）

### Step E — 反歧义检查

提交前必须自检：

- 是否还有“可选但没默认”的关键决策？
- 是否存在“建议”“大概”“尽量”而非明确规则？
- 是否缺少最终执行命令和 DoD？

---

## 6. impl techspec 文档模板（可直接复制）

> 路径：`docs/impl/<server-slug>/techspec.md`

```md
# <Server Name> MCP Server 技术规格

> 目标：只给本文件 + 需求源文档（及必要 API schema）即可一次性完成实现与验收。

## 0. 一口气执行入口
### 0.1 输入与变量
### 0.2 产物文件清单
### 0.3 端到端步骤（严格顺序）

## 1. 设计目标（必须同时满足）

## 2. 约束与命名
- package 命名
- 运行协议
- 技术栈

## 3. 需求源 → Endpoint/Tool 映射规范
- 参数类型映射
- 必填/可选规则
- description/enum 提取规则（如有）
- toolName 稳定生成规则

## 4. Runtime 规范
- 参数解析
- required 校验
- upstream 调用与超时
- 成功/错误信封
- 状态码映射

## 5. MCP Tool 规范
- 注册规则
- inputSchema 规则
- handler 输出规则

## 6. 入口规范
- stdio
- http（如需要）

## 7. package.json 脚本要求

## 8. 测试规范（最小覆盖）

## 9. README 要求

## 10. 交付验收（DoD）

## 11. 执行命令（最终必须跑）

## 12. 参考输入
```

---

## 7. 质量门槛（写 impl techspec 时必须满足）

1. **可执行性**：能按文档步骤直接实现。
2. **完整性**：输入、输出、错误、测试、命令齐全。
3. **一致性**：与仓库现有约定不冲突。
4. **可追溯性**：每条关键规则能回溯到需求源文件。

---

## 8. 面向 Xcode/Agent 的最小操作指令（推荐直接复用）

当你要生成某个工具的 impl techspec 时，可直接使用下面这段指令：

```text
读取 docs/guide.md 与 docs/tools/<selected-tool>.md。
严格按 docs/guide.md 的 SOP 与模板，在 docs/impl/<server-slug>/techspec.md 产出一份可执行技术规格。
要求：必须包含输入变量、产物文件清单、端到端步骤、runtime 规则、测试规范、DoD 和最终命令。
```

针对你当前约定的具体版本：

```text
读取并根据 docs/guide.md 的指南和 docs/tools/search_stops.md，写一份对应的 impl techspec。
```

当你已经提供 impl 路径与 swagger 时，使用下面这段（新默认）：

```text
已知：
- IMPL_DIR=<docs/impl 下目标路径>
- SWAGGER_PATH=<对应 swagger.json 路径>

请读取 docs/guide.md，并基于 SWAGGER_PATH 在 IMPL_DIR 下产出 techspec.md。
要求：
1) 输出文件固定为 IMPL_DIR/techspec.md；
2) 必须覆盖 endpoint/parameter 映射（含 description/enum 提取规则，如 swagger 有）；
3) 必须包含一口气执行入口、产物文件清单、runtime 规则、测试规范、DoD、最终命令；
4) 文档应可直接驱动实现，不得保留关键歧义。
```

---

## 9. 反模式（禁止）

- 只写概念说明，不给执行步骤
- 缺少 DoD 与最终验证命令
- 参数/错误行为只写“按常规处理”
- 未标注路径与文件清单
- 与需求源文档冲突却不说明

---

## 10. 维护原则

当实现行为发生变化（例如参数映射、错误信封、脚本命令）时，必须同步回写对应 impl techspec 与本指南，保持“文档可直接驱动实现”的能力不退化。
