import asyncio
import json
from typing import AsyncGenerator, Dict, List

from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

# ---------- Structured Output Models ----------


class EmotionAnalysisOutput(BaseModel):
    detected_mood: str = Field(description="Primary emotion detected, e.g. 'anxious', 'sad', 'calm'")
    severity: int = Field(description="Severity of emotional distress, 1 (fine) to 10 (crisis)", ge=1, le=10)


class GroundingPlanOutput(BaseModel):
    action_plan: List[str] = Field(description="Exactly 3 concise, actionable grounding steps")


# ---------- In-memory session store (NO DATABASE) ----------

_session_histories: Dict[str, InMemoryChatMessageHistory] = {}


def get_history(session_id: str = "default") -> InMemoryChatMessageHistory:
    if session_id not in _session_histories:
        _session_histories[session_id] = InMemoryChatMessageHistory()
    return _session_histories[session_id]


def clear_memory(session_id: str = "default") -> None:
    _session_histories[session_id] = InMemoryChatMessageHistory()


# ---------- LLM Clients ----------

emotion_llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0).with_structured_output(EmotionAnalysisOutput)
planner_llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3).with_structured_output(GroundingPlanOutput)
intervention_llm = ChatOpenAI(model="gpt-4o", temperature=0.7, streaming=True)

CRISIS_MESSAGE = (
    "I'm really concerned about your safety right now, and I want you to know you're not alone. "
    "Please reach out to the 988 Suicide & Crisis Lifeline immediately — call or text 988 "
    "(available 24/7 in the US). If you're outside the US, please contact your local emergency "
    "services or crisis line right away. Your life matters, and there are people who want to help "
    "you through this moment."
)

EMOTION_SYSTEM_PROMPT = (
    "You are a clinical emotion-analysis assistant for a mental wellness app. "
    "Analyze the user's message and classify their emotional state.\n"
    "Severity scale:\n"
    "1-4: normal everyday stress\n"
    "5-8: acute anxiety or sadness\n"
    "9-10: crisis, self-harm, or suicidal ideation\n"
    "Respond only with the structured output."
)

PLANNER_SYSTEM_PROMPT = (
    "You are a grounding-techniques planner for a mental wellness app. "
    "Given the user's message and detected mood, produce exactly 3 concise, "
    "actionable grounding steps (e.g. breathing exercises, sensory grounding, "
    "brief physical actions) the user can do right now. Keep each step under 15 words."
)

INTERVENTION_SYSTEM_PROMPT = (
    "You are NeuraWell, a warm, calming AI companion for mental wellness. "
    "Respond to the user with empathy and gentle, grounding language. "
    "Draw on natural imagery — flowing rivers, tranquil forests, ocean tides — "
    "to help the user feel calm and supported. Keep your tone soft, validating, "
    "and never clinical. Keep responses to 3-5 sentences unless the user asks for more."
)


async def analyze_emotion(user_message: str) -> EmotionAnalysisOutput:
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", EMOTION_SYSTEM_PROMPT),
            ("human", "{message}"),
        ]
    )
    chain = prompt | emotion_llm
    return await chain.ainvoke({"message": user_message})


async def generate_grounding_plan(user_message: str, mood: str) -> GroundingPlanOutput:
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", PLANNER_SYSTEM_PROMPT),
            ("human", "User message: {message}\nDetected mood: {mood}"),
        ]
    )
    chain = prompt | planner_llm
    return await chain.ainvoke({"message": user_message, "mood": mood})


async def process_chat_stream(user_message: str, session_id: str = "default") -> AsyncGenerator[str, None]:
    """Async generator yielding SSE-formatted `data: {...}\n\n` chunks."""
    history = get_history(session_id)

    emotion_result = await analyze_emotion(user_message)
    is_emergency = emotion_result.severity >= 9

    yield _sse(
        {
            "type": "metadata",
            "mood": emotion_result.detected_mood,
            "severity": emotion_result.severity,
            "is_emergency": is_emergency,
        }
    )

    history.add_message(HumanMessage(content=user_message))

    if is_emergency:
        yield _sse({"type": "token", "content": CRISIS_MESSAGE})
        history.add_message(AIMessage(content=CRISIS_MESSAGE))
        yield _sse({"type": "done"})
        return

    planner_task = asyncio.create_task(generate_grounding_plan(user_message, emotion_result.detected_mood))

    messages = [SystemMessage(content=INTERVENTION_SYSTEM_PROMPT), *history.messages[-10:]]

    full_response = ""
    async for chunk in intervention_llm.astream(messages):
        content = chunk.content
        if content:
            full_response += content
            yield _sse({"type": "token", "content": content})

    history.add_message(AIMessage(content=full_response))

    plan_result = await planner_task
    yield _sse({"type": "plan", "content": plan_result.action_plan})
    yield _sse({"type": "done"})


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"
