namespace AmmarAlani.Models;

public class Item
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal SalePrice1 { get; set; }
    public decimal MinQty { get; set; }
    public bool IsActive { get; set; } = true;
}
