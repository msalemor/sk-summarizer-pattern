from typing import List, Union
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os
from langchain.chat_models import AzureChatOpenAI
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.text_splitter import CharacterTextSplitter

load_dotenv()
deployment = os.getenv("DEPLOYMENT_NAME")
endpoint = os.getenv("ENDPOINT")
api_key = os.getenv("API_KEY")


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
    text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
        chunk_size=chunk_size, chunk_overlap=0
    )
    return text_splitter.split_text(content)


def call_llm(request: SummarizeRequest) -> str:

    llm = AzureChatOpenAI(
        openai_api_base=endpoint,
        openai_api_version="2023-05-15",
        deployment_name=deployment,
        openai_api_key=api_key,
        openai_api_type="azure",
        temperature=request.temperature,
        max_tokens=request.max_tokens,
    )

    if not request.content:
        prompt_template = request.prompt
        chain = LLMChain(llm=llm, prompt=PROMPT)
        result = chain.invoke()
        return result['text']

    if request.content:
        prompt_template = request.prompt.replace("<TEXT>", "{input}")
        PROMPT = PromptTemplate(
            template=prompt_template, input_variables=["input"]
        )
        chain = LLMChain(llm=llm, prompt=PROMPT)
        result = chain.invoke({"input": request.content})
        return result['text']


@app.post("/api/summarize", response_model=CompletionResponse)
async def post_summary(request: SummarizeRequest):
    if request.chunk_size == 0 or request.temperature == 0 or request.max_tokens == 0 or not request.prompt:
        raise HTTPException(status_code=404, detail="Item not found")

    fixedFunction = None
    result: str = None
    summaries: List[str] = []

    if not request.content:
        result = call_llm(request)
        return {"content": str(result), "summaries": summaries}

    if not request.chunk:
        result = call_llm(request)
        return {"content": str(result), "summaries": summaries}

    chunks = chunk_text(request.content, request.chunk_size)
    chunk_completions: List[str] = []

    for chunk in chunks:
        request.content = chunk
        result = call_llm(request)
        chunk_completions.append(str(result))

    if len(chunks) == 1:
        summaries.clear()
        summaries.append({"content": request.content,
                         "summary": chunk_completions[0]})
        return {"content": str(result), "summaries": summaries}

    sb = ""
    for content in chunk_completions:
        sb += content + "\n\n"

    request.content = sb
    result = call_llm(request)

    for i in range(len(chunks)):
        summaries.append(
            {"content": chunks[i], "summary": chunk_completions[i]})

    return {"content": str(result), "summaries": summaries}

app.mount("/", StaticFiles(directory="wwwroot", html=True), name="static")


# result = model(
#     [
#         HumanMessage(
#             content="Translate this sentence from English to French. I love programming."
#         )
#     ]
# )
# print(result.content)
# class CommaSeparatedListOutputParser(BaseOutputParser):
#     """Parse the output of an LLM call to a comma-separated list."""

#     def parse(self, text: str):
#         """Parse the output of an LLM call."""
#         return text.strip().split(", ")


# template = """You are a helpful assistant who generates comma separated lists.
# A user will pass in a category, and you should generate 5 objects in that category in a comma separated list.
# ONLY return a comma separated list, and nothing more."""
# human_template = "{text}"

# chat_prompt = ChatPromptTemplate.from_messages([
#     ("system", template),
#     ("human", human_template),
# ])

# chain = chat_prompt | model() | CommaSeparatedListOutputParser()
# chain.invoke({"text": "colors"})
