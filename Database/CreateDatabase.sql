CREATE DATABASE AmmarAlaniDB;
GO
USE AmmarAlaniDB;
GO

CREATE TABLE Branches (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Address NVARCHAR(250) NULL,
    Phone NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE Warehouses (
    Id INT IDENTITY PRIMARY KEY,
    BranchId INT NOT NULL,
    Name NVARCHAR(150) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Warehouses_Branches FOREIGN KEY (BranchId) REFERENCES Branches(Id)
);

CREATE TABLE Roles (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Users (
    Id INT IDENTITY PRIMARY KEY,
    UserName NVARCHAR(100) NOT NULL UNIQUE,
    FullName NVARCHAR(150) NOT NULL,
    PasswordHash NVARCHAR(300) NOT NULL,
    RoleId INT NOT NULL,
    BranchId INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id),
    CONSTRAINT FK_Users_Branches FOREIGN KEY (BranchId) REFERENCES Branches(Id)
);

CREATE TABLE Customers (
    Id INT IDENTITY PRIMARY KEY,
    Code NVARCHAR(50) NULL,
    Name NVARCHAR(150) NOT NULL,
    Phone NVARCHAR(50) NULL,
    Address NVARCHAR(250) NULL,
    CreditLimit DECIMAL(18,2) NOT NULL DEFAULT 0,
    Balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE Suppliers (
    Id INT IDENTITY PRIMARY KEY,
    Code NVARCHAR(50) NULL,
    Name NVARCHAR(150) NOT NULL,
    Phone NVARCHAR(50) NULL,
    Address NVARCHAR(250) NULL,
    Balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1
);

CREATE TABLE ItemCategories (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL
);

CREATE TABLE Units (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Symbol NVARCHAR(20) NULL
);

CREATE TABLE Items (
    Id INT IDENTITY PRIMARY KEY,
    CategoryId INT NULL,
    Name NVARCHAR(150) NOT NULL,
    EnglishName NVARCHAR(150) NULL,
    UnitId INT NOT NULL,
    Barcode NVARCHAR(100) NULL,
    PurchasePrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    SalePrice1 DECIMAL(18,2) NOT NULL DEFAULT 0,
    SalePrice2 DECIMAL(18,2) NOT NULL DEFAULT 0,
    SalePrice3 DECIMAL(18,2) NOT NULL DEFAULT 0,
    MinQty DECIMAL(18,3) NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Items_Categories FOREIGN KEY (CategoryId) REFERENCES ItemCategories(Id),
    CONSTRAINT FK_Items_Units FOREIGN KEY (UnitId) REFERENCES Units(Id)
);

CREATE TABLE SalesInvoices (
    Id BIGINT IDENTITY PRIMARY KEY,
    InvoiceNo NVARCHAR(50) NOT NULL,
    BranchId INT NOT NULL,
    WarehouseId INT NOT NULL,
    CustomerId INT NULL,
    UserId INT NOT NULL,
    InvoiceDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    NetAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    PaymentType NVARCHAR(50) NOT NULL,
    Notes NVARCHAR(300) NULL,
    CONSTRAINT FK_SalesInvoices_Branches FOREIGN KEY (BranchId) REFERENCES Branches(Id),
    CONSTRAINT FK_SalesInvoices_Warehouses FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id),
    CONSTRAINT FK_SalesInvoices_Customers FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    CONSTRAINT FK_SalesInvoices_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE TABLE SalesInvoiceItems (
    Id BIGINT IDENTITY PRIMARY KEY,
    SalesInvoiceId BIGINT NOT NULL,
    ItemId INT NOT NULL,
    Qty DECIMAL(18,3) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Total DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_SalesInvoiceItems_SalesInvoices FOREIGN KEY (SalesInvoiceId) REFERENCES SalesInvoices(Id),
    CONSTRAINT FK_SalesInvoiceItems_Items FOREIGN KEY (ItemId) REFERENCES Items(Id)
);

CREATE TABLE PurchaseInvoices (
    Id BIGINT IDENTITY PRIMARY KEY,
    InvoiceNo NVARCHAR(50) NOT NULL,
    BranchId INT NOT NULL,
    WarehouseId INT NOT NULL,
    SupplierId INT NOT NULL,
    UserId INT NOT NULL,
    InvoiceDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    NetAmount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Notes NVARCHAR(300) NULL,
    CONSTRAINT FK_PurchaseInvoices_Branches FOREIGN KEY (BranchId) REFERENCES Branches(Id),
    CONSTRAINT FK_PurchaseInvoices_Warehouses FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id),
    CONSTRAINT FK_PurchaseInvoices_Suppliers FOREIGN KEY (SupplierId) REFERENCES Suppliers(Id),
    CONSTRAINT FK_PurchaseInvoices_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE TABLE PurchaseInvoiceItems (
    Id BIGINT IDENTITY PRIMARY KEY,
    PurchaseInvoiceId BIGINT NOT NULL,
    ItemId INT NOT NULL,
    Qty DECIMAL(18,3) NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    Total DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_PurchaseInvoiceItems_PurchaseInvoices FOREIGN KEY (PurchaseInvoiceId) REFERENCES PurchaseInvoices(Id),
    CONSTRAINT FK_PurchaseInvoiceItems_Items FOREIGN KEY (ItemId) REFERENCES Items(Id)
);

CREATE TABLE Accounts (
    Id INT IDENTITY PRIMARY KEY,
    AccountNo NVARCHAR(50) NOT NULL,
    AccountName NVARCHAR(150) NOT NULL,
    ParentId INT NULL,
    AccountType NVARCHAR(50) NOT NULL,
    Balance DECIMAL(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT FK_Accounts_Parent FOREIGN KEY (ParentId) REFERENCES Accounts(Id)
);

CREATE TABLE JournalEntries (
    Id BIGINT IDENTITY PRIMARY KEY,
    EntryNo NVARCHAR(50) NOT NULL,
    EntryDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    Description NVARCHAR(250) NULL,
    UserId INT NOT NULL,
    CONSTRAINT FK_JournalEntries_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);

CREATE TABLE JournalEntryLines (
    Id BIGINT IDENTITY PRIMARY KEY,
    JournalEntryId BIGINT NOT NULL,
    AccountId INT NOT NULL,
    Debit DECIMAL(18,2) NOT NULL DEFAULT 0,
    Credit DECIMAL(18,2) NOT NULL DEFAULT 0,
    Note NVARCHAR(250) NULL,
    CONSTRAINT FK_JournalEntryLines_JournalEntries FOREIGN KEY (JournalEntryId) REFERENCES JournalEntries(Id),
    CONSTRAINT FK_JournalEntryLines_Accounts FOREIGN KEY (AccountId) REFERENCES Accounts(Id)
);

CREATE TABLE AuditLogs (
    Id BIGINT IDENTITY PRIMARY KEY,
    UserId INT NOT NULL,
    ActionName NVARCHAR(150) NOT NULL,
    TableName NVARCHAR(100) NULL,
    RecordId NVARCHAR(100) NULL,
    ActionDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    DeviceName NVARCHAR(100) NULL,
    Details NVARCHAR(MAX) NULL,
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId) REFERENCES Users(Id)
);
GO

INSERT INTO Roles (Name) VALUES (N'مدير النظام'), (N'كاشير'), (N'محاسب'), (N'أمين مخزن');
INSERT INTO Branches (Name) VALUES (N'الفرع الرئيسي');
INSERT INTO Warehouses (BranchId, Name) VALUES (1, N'المخزن الرئيسي');
INSERT INTO Users (UserName, FullName, PasswordHash, RoleId, BranchId)
VALUES (N'admin', N'مدير النظام', N'CHANGE_ME_HASH', 1, 1);
