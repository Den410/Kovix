using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSelectedTitle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SelectedAwardId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SelectedAwardId1",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "PasswordHash", "SelectedAwardId", "SelectedAwardId1" },
                values: new object[] { "$2a$11$exb95olSqkOocfTHfZ0UUuZLcb8.9Wtg4U.ArYR6EZ8FDdbckZT0W", null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Users_SelectedAwardId1",
                table: "Users",
                column: "SelectedAwardId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_UserAwards_SelectedAwardId1",
                table: "Users",
                column: "SelectedAwardId1",
                principalTable: "UserAwards",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_UserAwards_SelectedAwardId1",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_SelectedAwardId1",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SelectedAwardId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SelectedAwardId1",
                table: "Users");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$cYi5C0Qf0SnFKTUccPPGPeloVFU8DUPocBqcch9wINiOhNH3TDdVC");
        }
    }
}
