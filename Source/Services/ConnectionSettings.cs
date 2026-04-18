namespace AmmarAlani.Services;

public class ConnectionSettings
{
    public string ServerName { get; set; } = @"SERVER\\SQLEXPRESS";
    public string DatabaseName { get; set; } = "AmmarAlaniDB";
    public bool UseWindowsAuth { get; set; } = true;
    public string SqlUser { get; set; } = string.Empty;
    public string SqlPassword { get; set; } = string.Empty;

    public string BuildConnectionString()
    {
        if (UseWindowsAuth)
        {
            return $"Server={ServerName};Database={DatabaseName};Trusted_Connection=True;TrustServerCertificate=True;";
        }

        return $"Server={ServerName};Database={DatabaseName};User Id={SqlUser};Password={SqlPassword};TrustServerCertificate=True;";
    }
}
