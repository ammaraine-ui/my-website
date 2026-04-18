using System.Collections.ObjectModel;

namespace AmmarAlani.ViewModels;

public class MainDashboardViewModel : BaseViewModel
{
    public ObservableCollection<string> MainModules { get; } = new()
    {
        "المبيعات",
        "المشتريات",
        "المواد",
        "المخازن",
        "الحسابات",
        "العملاء",
        "الموردين",
        "المستخدمين",
        "الموظفين",
        "التقارير",
        "الإعدادات"
    };
}
