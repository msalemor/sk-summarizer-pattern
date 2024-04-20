namespace Models;

#region Models

public record SummarizeRequest(string prompt, string content, int chunk_size = 250, int max_tokens = 1000, double temperature = 0.2, bool chunk = true);
public record CompletionResponse(string content, List<Summary> summaries);
public record Summary(string content, string summary);

#endregion