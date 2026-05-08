using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryModeration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProposedByUserId",
                table: "ForumCategories",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "ForumCategories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$o8MO1sfY2C7v4YKcCqdhSevO.WDsWPXvo9vFoFNER8lR8yjR.j/6u");

            migrationBuilder.CreateIndex(
                name: "IX_ForumCategories_ProposedByUserId",
                table: "ForumCategories",
                column: "ProposedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ForumCategories_Users_ProposedByUserId",
                table: "ForumCategories",
                column: "ProposedByUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ForumCategories_Users_ProposedByUserId",
                table: "ForumCategories");

            migrationBuilder.DropIndex(
                name: "IX_ForumCategories_ProposedByUserId",
                table: "ForumCategories");

            migrationBuilder.DropColumn(
                name: "ProposedByUserId",
                table: "ForumCategories");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ForumCategories");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$H/XOquagI/ntHNYtenw.I.Un4emPxpEPD23zH1/29dA2/lmp7AxWq");
        }
    }
}
