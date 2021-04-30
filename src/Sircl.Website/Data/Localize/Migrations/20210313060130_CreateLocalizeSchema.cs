using Microsoft.EntityFrameworkCore.Migrations;

namespace Sircl.Website.Data.Localize.Migrations
{
    public partial class CreateLocalizeSchema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "localize");

            migrationBuilder.CreateTable(
                name: "Domain",
                schema: "localize",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Cultures = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Domain", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Key",
                schema: "localize",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DomainId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ForPath = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ParameterNames = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Key", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Key_Domain_DomainId",
                        column: x => x.DomainId,
                        principalSchema: "localize",
                        principalTable: "Domain",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Query",
                schema: "localize",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DomainId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ConnectionName = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Sql = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Query", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Query_Domain_DomainId",
                        column: x => x.DomainId,
                        principalSchema: "localize",
                        principalTable: "Domain",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KeyValue",
                schema: "localize",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    KeyId = table.Column<int>(type: "int", nullable: false),
                    Culture = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Reviewed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeyValue", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KeyValue_Key_KeyId",
                        column: x => x.KeyId,
                        principalSchema: "localize",
                        principalTable: "Key",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Key_DomainId",
                schema: "localize",
                table: "Key",
                column: "DomainId");

            migrationBuilder.CreateIndex(
                name: "IX_KeyValue_KeyId",
                schema: "localize",
                table: "KeyValue",
                column: "KeyId");

            migrationBuilder.CreateIndex(
                name: "IX_Query_DomainId",
                schema: "localize",
                table: "Query",
                column: "DomainId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "KeyValue",
                schema: "localize");

            migrationBuilder.DropTable(
                name: "Query",
                schema: "localize");

            migrationBuilder.DropTable(
                name: "Key",
                schema: "localize");

            migrationBuilder.DropTable(
                name: "Domain",
                schema: "localize");
        }
    }
}
