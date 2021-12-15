using Microsoft.EntityFrameworkCore.Migrations;

namespace Sircl.Website.Data.Content.Migrations
{
    public partial class SeedInitialData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData("DataType",
                new string[] { "Id", "Name", "Template", "Settings" },
                new object[]{ 1, "Checkbox", "ContentBoolean", (string)null },
                "content");

            migrationBuilder.InsertData("DataType",
                new string[] { "Id", "Name", "Template", "Settings" },
                new object[]{ 2, "Html", "ContentHtml", "\"Rows\": 5" },
                "content");

            migrationBuilder.InsertData("DataType",
                new string[] { "Id", "Name", "Template", "Settings" },
                new object[] { 3, "Script", "ContentHtmlRaw", "\"Rows\": 5" },
                "content");

            migrationBuilder.InsertData("DataType",
                new string[] { "Id", "Name", "Template", "Settings" },
                new object[] { 4, "Select", "ContentSelect", (string)null },
                "content");

            migrationBuilder.InsertData("DataType",
                new string[] { "Id", "Name", "Template", "Settings" },
                new object[] { 5, "TextLine", "ContentString", (string)null },
                "content");

            migrationBuilder.InsertData("DataType",
                new string[] { "Id", "Name", "Template", "Settings" },
                new object[] { 6, "TextBlock", "ContentText", "\"Rows\": 5" },
                "content");

            migrationBuilder.InsertData("DocumentType",
                new string[] { "Id", "Name", "ViewName", "BaseId", "IsInstantiable" },
                new object[]{ 1, "Page", "ContentPage", (int?)null, true },
                "content");

            migrationBuilder.InsertData("PropertyType",
                new string[] { "Id", "Name", "DisplayOrder", "DocumentTypeId", "DataTypeId", "Settings" },
                new object[]{ 1, "Title", 0, 1, 5, (string)null },
                "content");

            migrationBuilder.InsertData("PropertyType",
                new string[] { "Id", "Name", "DisplayOrder", "DocumentTypeId", "DataTypeId", "Settings" },
                new object[]{ 2, "Body", 1, 1, 2, "\"Rows\": 16" },
                "content");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData("PropertyType", "Id", new object[] { 1, 2 }, "content");

            migrationBuilder.DeleteData("DocumentType", "Id", new object[] { 1 }, "content");

            migrationBuilder.DeleteData("DataType", "Id", new object[] { 1, 2, 3, 4, 5, 6 }, "content");
        }
    }
}
