import asyncio

from flask import Flask, Response, jsonify, request, stream_with_context
from flask_cors import CORS

from agent_core import analyze_emotion, clear_memory, process_chat_stream

app = Flask(__name__)
CORS(app)


def _run_async(coro):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


def _sse_stream(user_message: str, session_id: str):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    agen = process_chat_stream(user_message, session_id)
    try:
        while True:
            try:
                yield loop.run_until_complete(agen.__anext__())
            except StopAsyncIteration:
                break
    finally:
        loop.close()


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = (data.get("message") or "").strip()
    session_id = data.get("session_id", "default")

    if not user_message:
        return jsonify({"error": "message is required"}), 400

    return Response(
        stream_with_context(_sse_stream(user_message, session_id)),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.route("/api/journal", methods=["POST"])
def journal():
    data = request.get_json(silent=True) or {}
    entry = (data.get("entry") or "").strip()

    if not entry:
        return jsonify({"error": "entry is required"}), 400

    result = _run_async(analyze_emotion(entry))

    return jsonify(
        {
            "detected_mood": result.detected_mood,
            "severity": result.severity,
            "is_emergency": result.severity >= 9,
        }
    )


@app.route("/api/clear", methods=["POST"])
def clear():
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id", "default")
    clear_memory(session_id)
    return jsonify({"status": "success"})


if __name__ == "__main__":
    app.run(debug=True, port=5000, threaded=True)
