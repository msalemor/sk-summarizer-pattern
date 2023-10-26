import time
from typing import List, Union
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
import semantic_kernel as sk
import semantic_kernel.text as text
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion


from dotenv import load_dotenv
import os

kernel = sk.Kernel()
load_dotenv()


deployment = os.getenv("DEPLOYMENT_NAME")
endpoint = os.getenv("ENDPOINT")
api_key = os.getenv("API_KEY")


kernel.add_chat_service(
    "chat-gpt", AzureChatCompletion(deployment, endpoint, api_key))


class SummarizeRequest(BaseModel):
    prompt: str
    content: str | None
    chunk_size: int = 100
    max_tokens: int = 100
    temperature: float = 0.3
    chunk: bool = True


class Summary(BaseModel):
    content: str
    summary: str


class CompletionResponse(BaseModel):
    content: str
    summaries: List[Summary]


app = FastAPI()


def chunk_text(content: str, chunk_size: int) -> List[str]:
    lines = text.split_plaintext_lines(content, chunk_size / 2)
    return text.split_plaintext_paragraph(lines, chunk_size)


@app.post("/api/summarize", response_model=CompletionResponse)
async def post_summary(request: SummarizeRequest):
    if request.chunk_size == 0 or request.temperature == 0 or request.max_tokens == 0 or not request.prompt:
        raise HTTPException(status_code=404, detail="Item not found")

    fixedFunction = None
    result: str = None
    summaries: List[str] = []

    if not request.content:
        fixedFunction = kernel.create_semantic_function(
            request.prompt, max_tokens=request.max_tokens, temperature=request.temperature)
        result = fixedFunction()
        print(result)
        return {"content": str(result), "summaries": summaries}

    if not request.chunk:
        prompt = request.prompt.replace("<TEXT>", request.content)
        fixedFunction = kernel.create_semantic_function(
            prompt, max_tokens=request.max_tokens, temperature=request.temperature)
        result = fixedFunction()
        return {"content": str(result), "summaries": summaries}

    chunks = chunk_text(request.content, request.chunk_size)
    chunk_completions: List[str] = []

    for chunk in chunks:
        prompt = request.prompt.replace("<TEXT>", chunk)
        fixedFunction = kernel.create_semantic_function(
            prompt, max_tokens=request.max_tokens, temperature=request.temperature)
        result = fixedFunction()
        chunk_completions.append(str(result))

    if len(chunks) == 1:
        summaries.clear()
        summaries.append({"content": request.content,
                         "summary": chunk_completions[0]})
        return {"content": str(result), "summaries": summaries}

    sb = ""
    for content in chunk_completions:
        sb += content + "\n\n"

    prompt = request.prompt.replace("<TEXT>", sb)
    fixedFunction = kernel.create_semantic_function(
        prompt, max_tokens=request.max_tokens, temperature=request.temperature)
    result = fixedFunction()

    for i in range(len(chunks)):
        summaries.append(
            {"content": chunks[i], "summary": chunk_completions[i]})

    return {"content": str(result), "summaries": summaries}

app.mount("/", StaticFiles(directory="wwwroot", html=True), name="static")
