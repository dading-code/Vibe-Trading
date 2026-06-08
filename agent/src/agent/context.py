"""ContextBuilder: builds LLM message context for the ReAct AgentLoop."""

from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Optional

from src.agent.memory import WorkspaceMemory
from src.agent.skills import SkillsLoader
from src.agent.tools import ToolRegistry

if TYPE_CHECKING:
    from src.memory.persistent import PersistentMemory

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """你必须用中文回复！这是强制要求，没有例外！

你是一个金融研究智能体，拥有 {skill_count} 个专业技能、{tool_count} 个工具、7 个数据源（带自动降级）和 29 个多智能体协作团队。
你可以处理回测（backtesting）、因子分析（factor analysis）、期权定价（options pricing）、风险审计（risk audits）、研究报告、文档/网页阅读、网络搜索和团队协作工作流。

## 语言要求

**强制使用中文回复！**

- 所有文本输出必须使用中文
- 工具调用的参数和解释必须使用中文
- 思考过程必须使用中文
- 绝对禁止使用英文或其他语言
- 如果违反此规则，将被视为严重错误

## 工具

{tool_descriptions}

## 技能（使用 load_skill 读取完整文档）

{skill_descriptions}

## 当前状态

{memory_summary}

## 任务路由

根据用户请求决定使用哪个工作流：

**回测（Backtest）** — 用户想要创建、测试或优化交易策略：
1. `load_skill("strategy-generate")` — 阅读 SignalEngine 合约
2. `write_file("config.json", ...)` — 设置数据源、股票代码、日期、参数
3. `write_file("code/signal_engine.py", ...)` — 编写 SignalEngine 类
4. 语法检查 → `backtest(run_dir=...)` → `read_file("artifacts/metrics.csv")`
5. 不要写 run_backtest.py，引擎已内置。

**协作团队（Swarm team）** — 仅在用户明确请求团队/委员会/swarm 分析时使用：
- 调用 `run_swarm(prompt="<用户完整请求>")` — 自动选择合适的预设配置。
- 除非用户明确要求团队或委员会分析，否则不要使用 swarm。

**分析/研究（Analysis / research）** — 用户想要因子分析、期权定价、市场数据或一般研究：
- 先加载相关技能，然后使用匹配的工具（factor_analysis、options_pricing、bash 用于自定义脚本）。

**文档/网页（Document / web）** — 用户提供 PDF 或 URL：
- PDF 使用 `read_document(path=...)`，网页使用 `read_url(url=...)`。

**交易日记（Trade journal）** — 用户上传 CSV/Excel 券商导出（交割单）或要求分析自己的交易历史：
1. `load_skill("trade-journal")` — 阅读分析方法和报告模板
2. `analyze_trade_journal(file_path=..., analysis_type="full")` — 解析 + 画像 + 行为诊断
3. 以 markdown 报告形式呈现结果。提供后续分析选项：时间切片、标的深度分析、市场拆分。
4. 如果用户问"接下来做什么/我能做得更好吗/如果我更自律会怎样"，切换到下面的 **Shadow Account** 流程。

**影子账户（Shadow Account）** — 用户要求提取策略、"训练影子"、对自己的盈利模式进行多市场回测，或询问"我错失了多少收益"：
1. **必须**首先调用 `load_skill("shadow-account")` — 该技能定义规则、方法论、归因语义，是必需的上下文
2. 确认交易日记已解析（同一会话或已知 `journal_path`）。如果没有，先运行 `analyze_trade_journal`。
3. `extract_shadow_strategy(journal_path=...)` → 显示规则，让用户确认是否符合他们的交易行为
4. `run_shadow_backtest(shadow_id=..., journal_path=...)` → 多市场指标 + delta 归因
5. `render_shadow_report(shadow_id=...)` → 分享 html/pdf 路径，重点展示第 5 节"你 vs shadow"差异
6. 可选：应请求调用 `scan_shadow_signals(shadow_id=...)`（始终附上仅供研究的免责声明）
**绝对不要**在未先加载 `shadow-account` 技能的情况下调用 `extract_shadow_strategy` / `run_shadow_backtest` / `render_shadow_report` / `scan_shadow_signals`。

## 指南

- 在开始任何任务前，先加载相关技能。技能包含精确的 API 合约和示例。
- 如果关键信息缺失（资产、日期、策略类型），请询问用户。切勿猜测。
- 对于多行数据（指标、比较、时间表、持仓、Top-N 列表），使用 markdown 管道表格格式（`| 列 | 列 |` 带 `|---|---|` 分隔符）输出结果。渲染器会将其升级为原生表格。回测后，始终报告：total_return、sharpe、max_drawdown、trade_count。
- 不要使用 `---` 水平线分隔段落 — 它们在 CLI 和网页上都会显示为难看的全宽线条。改用 `##` / `###` markdown 标题。
- 所有文件路径都是相对于 run_dir 的（自动注入）。
- 你拥有跨会话的持久记忆（`remember` 工具）。当用户分享偏好、策略见解或重要发现时，保存它们以供将来会话使用。
- 当工作流成功时，你可以创建可重用的技能（`save_skill`），当 API 变更时可以修复它们（`patch_skill`）。
{memory_section}
## 当前日期和时间

今天是 {current_datetime}。
"""

_MEMORY_SECTION = """
## 持久记忆（跨会话）

{snapshot}

"""


class ContextBuilder:
    """Builds message context for AgentLoop.

    Attributes:
        registry: Tool registry.
        memory: Workspace memory.
        skills_loader: Skills loader.
        response_language: Language for AI responses.
    """

    def __init__(self, registry: ToolRegistry, memory: WorkspaceMemory,
                 skills_loader: Optional[SkillsLoader] = None,
                 persistent_memory: Optional[PersistentMemory] = None,
                 response_language: str = "Chinese") -> None:
        """Initialize ContextBuilder.

        Args:
            registry: Tool registry.
            memory: Workspace memory.
            skills_loader: Skills loader (auto-created if not provided).
            persistent_memory: PersistentMemory instance for cross-session recall.
            response_language: Language for AI responses (default: Chinese).
        """
        self.registry = registry
        self.memory = memory
        self.skills_loader = skills_loader or SkillsLoader()
        self._persistent_memory = persistent_memory
        self._response_language = response_language

    def build_system_prompt(self, user_message: str = "") -> str:
        """Build system prompt.

        Injects one-line skill summaries via get_descriptions; full docs loaded on demand by load_skill.
        PersistentMemory snapshot is frozen at session start (preserves prompt cache).

        Args:
            user_message: User message (kept for API compatibility).

        Returns:
            System prompt text.
        """
        now = datetime.now()

        memory_section = ""
        if self._persistent_memory and self._persistent_memory.snapshot:
            memory_section = _MEMORY_SECTION.format(
                snapshot=self._persistent_memory.snapshot,
            )

        return _SYSTEM_PROMPT.format(
            tool_count=len(self.registry._tools),
            skill_count=len(self.skills_loader.skills),
            tool_descriptions=self._format_tool_descriptions(),
            skill_descriptions=self.skills_loader.get_descriptions(),
            memory_summary=self.memory.to_summary(),
            memory_section=memory_section,
            current_datetime=now.strftime("%A, %B %d, %Y %H:%M (local)"),
        )

    def build_messages(self, user_message: str, history: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """Build full message list.

        Auto-recalls relevant persistent memories and injects them into the
        user message as context. This keeps the system prompt stable (cacheable)
        while providing per-query relevant memories.

        Args:
            user_message: User message.
            history: Prior conversation messages.

        Returns:
            OpenAI-format message list.
        """
        messages: List[Dict[str, Any]] = [
            {"role": "system", "content": self.build_system_prompt(user_message)},
        ]
        if history:
            messages.extend(history)

        enriched = user_message
        if self._persistent_memory:
            try:
                recalls = self._persistent_memory.find_relevant(user_message, max_results=3)
                if recalls:
                    lines = [f"- **{r.title}** ({r.memory_type}): {r.body[:500]}" for r in recalls]
                    recall_block = "\n".join(lines)
                    enriched = (
                        f"<recalled-memories>\n{recall_block}\n</recalled-memories>\n\n"
                        f"{user_message}"
                    )
            except Exception as exc:
                logger.debug("Auto-recall failed: %s", exc)

        messages.append({"role": "user", "content": enriched})
        return messages

    def _format_tool_descriptions(self) -> str:
        """Format tool descriptions."""
        lines = []
        for tool in self.registry._tools.values():
            params = tool.parameters.get("properties", {})
            required = tool.parameters.get("required", [])
            param_parts = []
            for pname, pschema in params.items():
                req = " (required)" if pname in required else ""
                param_parts.append(f"    - {pname}: {pschema.get('description', pschema.get('type', ''))}{req}")
            param_text = "\n".join(param_parts) if param_parts else "    (no params)"
            lines.append(f"### {tool.name}\n{tool.description}\n  Params:\n{param_text}")
        return "\n\n".join(lines)

    @staticmethod
    def format_tool_result(tool_call_id: str, tool_name: str, result: str) -> Dict[str, Any]:
        """Format a tool execution result as a message."""
        return {
            "role": "tool",
            "tool_call_id": tool_call_id,
            "name": tool_name,
            "content": result,
        }

    @staticmethod
    def format_assistant_tool_calls(
        tool_calls: list,
        content: Optional[str] = None,
        reasoning_content: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Format an assistant tool_calls message, preserving thinking text.

        Args:
            tool_calls: List of tool call objects.
            content: Final assistant text (may include inlined thinking for
                providers that stream reasoning as content).
            reasoning_content: Provider-specific reasoning field (Kimi K2.5,
                DeepSeek reasoner, Qwen thinking). Only attached to the output
                message when not None, so non-thinking providers see no change.

        Returns:
            OpenAI-format assistant message.
        """
        message = {
            "role": "assistant",
            "content": content,
            "tool_calls": [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.name,
                        "arguments": json.dumps(tc.arguments, ensure_ascii=False),
                    },
                }
                for tc in tool_calls
            ],
        }
        if reasoning_content is not None:
            message["reasoning_content"] = reasoning_content
        return message