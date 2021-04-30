using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Sircl.Website.Data.Content.Migrations
{
    public partial class CreateContentSchema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "content");

            migrationBuilder.CreateTable(
                name: "DataType",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Template = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Settings = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DocumentType",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ViewName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    BaseId = table.Column<int>(type: "int", nullable: true),
                    IsInstantiable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentType", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentType_DocumentType_BaseId",
                        column: x => x.BaseId,
                        principalSchema: "content",
                        principalTable: "DocumentType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SecuredPath",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Path = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Roles = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecuredPath", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Document",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Culture = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SortKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Path = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    PathSegmentsCount = table.Column<int>(type: "int", nullable: true),
                    TypeId = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ModifiedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PublicationRequestedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PublicationRequestedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    PublishedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PublishedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    DeletedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: true, computedColumnSql: "CASE WHEN [DeletedOnUtc] IS NOT NULL THEN 'Deleted' WHEN [PublishedOnUtc] IS NOT NULL THEN 'Published' WHEN [PublicationRequestedOnUtc] IS NOT NULL THEN 'To publish' ELSE 'New' END")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Document", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Document_DocumentType_TypeId",
                        column: x => x.TypeId,
                        principalSchema: "content",
                        principalTable: "DocumentType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PropertyType",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    DocumentTypeId = table.Column<int>(type: "int", nullable: false),
                    DataTypeId = table.Column<int>(type: "int", nullable: false),
                    Settings = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PropertyType", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PropertyType_DataType_DataTypeId",
                        column: x => x.DataTypeId,
                        principalSchema: "content",
                        principalTable: "DataType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PropertyType_DocumentType_DocumentTypeId",
                        column: x => x.DocumentTypeId,
                        principalSchema: "content",
                        principalTable: "DocumentType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Property",
                schema: "content",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentId = table.Column<int>(type: "int", nullable: false),
                    TypeId = table.Column<int>(type: "int", nullable: true),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Settings = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Property", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Property_Document_DocumentId",
                        column: x => x.DocumentId,
                        principalSchema: "content",
                        principalTable: "Document",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Property_PropertyType_TypeId",
                        column: x => x.TypeId,
                        principalSchema: "content",
                        principalTable: "PropertyType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Document_TypeId",
                schema: "content",
                table: "Document",
                column: "TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentType_BaseId",
                schema: "content",
                table: "DocumentType",
                column: "BaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Property_DocumentId",
                schema: "content",
                table: "Property",
                column: "DocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_Property_TypeId",
                schema: "content",
                table: "Property",
                column: "TypeId");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyType_DataTypeId",
                schema: "content",
                table: "PropertyType",
                column: "DataTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyType_DocumentTypeId",
                schema: "content",
                table: "PropertyType",
                column: "DocumentTypeId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Property",
                schema: "content");

            migrationBuilder.DropTable(
                name: "SecuredPath",
                schema: "content");

            migrationBuilder.DropTable(
                name: "Document",
                schema: "content");

            migrationBuilder.DropTable(
                name: "PropertyType",
                schema: "content");

            migrationBuilder.DropTable(
                name: "DataType",
                schema: "content");

            migrationBuilder.DropTable(
                name: "DocumentType",
                schema: "content");
        }
    }
}
