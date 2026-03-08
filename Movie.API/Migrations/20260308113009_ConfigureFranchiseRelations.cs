using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureFranchiseRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FranchiseId",
                table: "Movies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrderInFranchise",
                table: "Movies",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Franchises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Franchises", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Movies",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FranchiseId", "OrderInFranchise" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Movies",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "FranchiseId", "OrderInFranchise" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Movies",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "FranchiseId", "OrderInFranchise" },
                values: new object[] { null, null });

            migrationBuilder.UpdateData(
                table: "Movies",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "FranchiseId", "OrderInFranchise" },
                values: new object[] { null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Movies_FranchiseId",
                table: "Movies",
                column: "FranchiseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Movies_Franchises_FranchiseId",
                table: "Movies",
                column: "FranchiseId",
                principalTable: "Franchises",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Movies_Franchises_FranchiseId",
                table: "Movies");

            migrationBuilder.DropTable(
                name: "Franchises");

            migrationBuilder.DropIndex(
                name: "IX_Movies_FranchiseId",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "FranchiseId",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "OrderInFranchise",
                table: "Movies");
        }
    }
}
