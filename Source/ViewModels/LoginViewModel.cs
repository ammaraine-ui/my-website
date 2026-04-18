namespace AmmarAlani.ViewModels;

public class LoginViewModel : BaseViewModel
{
    private string _userName = string.Empty;
    private string _password = string.Empty;
    private string _serverStatus = "غير متصل";

    public string UserName
    {
        get => _userName;
        set { _userName = value; OnPropertyChanged(); }
    }

    public string Password
    {
        get => _password;
        set { _password = value; OnPropertyChanged(); }
    }

    public string ServerStatus
    {
        get => _serverStatus;
        set { _serverStatus = value; OnPropertyChanged(); }
    }
}
