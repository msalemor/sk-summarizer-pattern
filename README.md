# An AOAI Summarizer implementation with Semantic Kernel

This a summarizer (Map Reduce/Refine) implementation using Semantic Kernel and OpenAI GPT. This application can use the GPT's foundational model abilities to summarize, translate, analyze risks, etc. a large text source.

I implemented this app as a C# Minimal API serving both static files and acting as an API server, but with minor modifications, the same code could power an async job to process a large number of files for example in a storage account.

Summarization and RAG pattern could be combined into a powerful solution where based on users' choices they could get answers from multiple sources using the RAG pattern or deep answers from specific documents and sources using summarization.

## Frontend

- Bun
- React
- Axios
- React-markdown

## Server

- .NET 7 C# Minimal API
- Static Files
- Semantic Kernel

### Running locally

- Change to the `server` folder
- Type: `make run`
- Open a browser at: `http://localhost:5084`

### Run a container locally with Docker

- Change into the `server` folder
- Type: `make run`
- Open a browser at: `http://localhost:8080`

### Build Docker Container

- Change into the `server` folder
- Type: `make docker`
