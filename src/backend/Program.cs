using System.Text;
using dotenv.net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Orchestration;
using Microsoft.SemanticKernel.SkillDefinition;
using Microsoft.SemanticKernel.Text;
using Models;

var builder = WebApplication.CreateBuilder(args);

// Read settings
DotEnv.Load();
var deploymentName = Environment.GetEnvironmentVariable("DEPLOYMENT_NAME") ?? "";
var endpoint = Environment.GetEnvironmentVariable("ENDPOINT") ?? "";
var apiKey = Environment.GetEnvironmentVariable("API_KEY") ?? "";

// Validation: Make sure that items are set
if (string.IsNullOrEmpty(deploymentName) || string.IsNullOrEmpty(endpoint) || string.IsNullOrEmpty(apiKey))
{
    Console.WriteLine("Missing configuration for Azure OpenAI GPT model. Please set DEPLOYMENT_NAME, ENDPOINT, and API_KEY environment variables.");
    Environment.Exit(1);
}

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("DefaultPolicy", policy =>
    {
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

IKernel kernel = new KernelBuilder()
    .WithAzureChatCompletionService(deploymentName, endpoint, apiKey)
    .Build();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("DefaultPolicy");

//app.UseHttpsRedirection();
//app.UseAuthorization();

/// <summary>
/// Breaks text into chunks of a given size.
/// </summary>
/// <param name="content">The text to break into chunks.</param>
/// <param name="chunk_size">The size of each chunk.</param>
/// <returns>A list of chunks.</returns>
List<string> ChunkText(string content, int chunk_size)
{
    var lines = TextChunker.SplitPlainTextLines(content, chunk_size / 2);
    // return paragraphs
    return TextChunker.SplitPlainTextParagraphs(lines, chunk_size);
}

/// <summary>
/// Summarizes text.
/// </summary>
/// <param name="prompt">The prompt to use for the completion.</param>
/// <param name="content">The text to summarize.</param>
/// <param name="chunk_size">The size of each chunk.</param>
/// <param name="max_tokens">The maximum number of tokens to generate.</param>
/// <param name="temperature">The temperature to use for the completion.</param>
/// <returns>A completion response.</returns>
app.MapPost("/api/summarize", async ([FromBody] SummarizeRequest request) =>
{
    var prompt = string.Empty;
    ISKFunction? fixedFunction;
    SKContext? result;
    var summaries = new List<Summary>();

    if (request.chunk_size == 0 || request.temperature == 0 || request.max_tokens == 0 || string.IsNullOrEmpty(request.prompt))
    {
        return Results.BadRequest();
    }

    // Step 1: See if it is a simple prompt, if so just return the completion
    // TODO: review logic when there's a template 
    //   if (string.IsNullOrEmpty(request.content) || request.content.IndexOf("<TEXT>") == -1)
    if (string.IsNullOrEmpty(request.content))
    {
        fixedFunction = kernel.CreateSemanticFunction(request.prompt, maxTokens: request.max_tokens, temperature: request.temperature);
        result = await kernel.RunAsync(fixedFunction);
        return Results.Ok(new CompletionResponse(result.ToString(), summaries));
    }

    if (!request.chunk)
    {
        prompt = request.prompt.Replace("<TEXT>", request.content);
        fixedFunction = kernel.CreateSemanticFunction(prompt, maxTokens: request.max_tokens, temperature: request.temperature);
        result = await kernel.RunAsync(fixedFunction);
        return Results.Ok(new CompletionResponse(result.ToString(), summaries));
    }

    // Step 2: apply the prompt to each chunk
    var chunks = ChunkText(request.content, request.chunk_size);

    var chunkCompletions = new List<string>();
    foreach (var chunk in chunks)
    {
        prompt = request.prompt.Replace("<TEXT>", chunk);
        fixedFunction = kernel.CreateSemanticFunction(prompt, maxTokens: request.max_tokens, temperature: request.temperature);

        // TODO: This could run concurrently for increased performance, but doing it sequentially to spare resources
        // Keep a list of tasks: List<Task<SKContext>> tasks = new();
        // Instead of await run all tasks: tasks.Add(kernel.RunAsync(fixedFunction));
        // Wait for all tasks to complete: Task.WhenAll(tasks)
        // Get the results from all tasks: tasks[0].Result, tasks[1].Result, ...

        result = await kernel.RunAsync(fixedFunction);
        chunkCompletions.Add(result.ToString());
    }

    // If there's only one chunk, don't do further processing and return the result
    if (chunks.Count == 1)
    {
        summaries.Clear();
        summaries = new List<Summary>
        {
            new(request.content, chunkCompletions[0])
        };
        return Results.Ok(new CompletionResponse(chunkCompletions[0], summaries));
    }

    // Step 3: Combine the chunk results
    var sb = new StringBuilder();
    foreach (var content in chunkCompletions)
    {
        sb.Append(content + "\n\n");
    }

    // Step 4: Apply the prompt to the combined chunk results
    prompt = request.prompt.Replace("<TEXT>", sb.ToString());
    fixedFunction = kernel.CreateSemanticFunction(prompt, maxTokens: request.max_tokens, temperature: request.temperature);
    result = await kernel.RunAsync(fixedFunction);

    // Step 5: return the completion
    summaries.Clear();
    for (var i = 0; i < chunks.Count; i++)
    {
        summaries.Add(new(chunks[i], chunkCompletions[i]));
    }
    return Results.Ok(new CompletionResponse(result.ToString(), summaries));
});

// Serve static files
app.UseStaticFiles();
// Load the index.html file from static files by default
app.MapFallbackToFile("index.html");

app.Run();

