using Microsoft.EntityFrameworkCore.Migrations;

namespace Sircl.Website.Data.Localize.Migrations
{
    public partial class AddValuesToReview : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ValuesToReview",
                schema: "localize",
                table: "Key",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Cultures",
                schema: "localize",
                table: "Domain",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ValuesToReview",
                schema: "localize",
                table: "Key");

            migrationBuilder.AlterColumn<string>(
                name: "Cultures",
                schema: "localize",
                table: "Domain",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);
        }
    }
}
