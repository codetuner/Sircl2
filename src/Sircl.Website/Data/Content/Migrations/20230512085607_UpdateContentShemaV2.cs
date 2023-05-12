using Microsoft.EntityFrameworkCore.Migrations;

namespace Sircl.Website.Data.Content.Migrations
{
    public partial class UpdateContentShemaV2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                schema: "content",
                table: "SecuredPath",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PathRedirection",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Position = table.Column<int>(type: "int", nullable: false),
                    FromPath = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ToPath = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    StatusCode = table.Column<int>(type: "int", nullable: false),
                    IsRegex = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PathRedirection", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PathRedirection",
                schema: "content");

            migrationBuilder.DropColumn(
                name: "Notes",
                schema: "content",
                table: "SecuredPath");
        }
    }
}
