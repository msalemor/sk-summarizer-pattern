# An AOAI Summarizer implementation with Semantic Kernel

A summarizer (Map Reduce/Refine) implementation using Semantic Kernel. This application can use the power of OpenAI GPT to summarize, translate, analyze risks, etc. a large text source. It was implemented as an API, but with minor modifications, the code same code could power an ansyc job to process a large number of files for example in a storage account. Summarization and RAG pattern could be combined into a powerful solution where users may want answers from multiple sources or deep answers from specific documents and sources.

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
