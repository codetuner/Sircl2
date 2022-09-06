using Microsoft.EntityFrameworkCore.Migrations;

namespace Sircl.Website.Data.Localize.Migrations
{
    public partial class AddMimeType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MimeType",
                schema: "localize",
                table: "Key",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MimeType",
                schema: "localize",
                table: "Key");
        }
    }
}
