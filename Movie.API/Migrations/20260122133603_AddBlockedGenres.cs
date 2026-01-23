using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBlockedGenres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MovieReactions_Movies_MovieEntityId",
                table: "MovieReactions");

            migrationBuilder.DropIndex(
                name: "IX_MovieReactions_MovieEntityId",
                table: "MovieReactions");

            migrationBuilder.DropColumn(
                name: "MovieEntityId",
                table: "MovieReactions");

            migrationBuilder.AddColumn<string>(
                name: "BlockedGenres",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BlockedGenres",
                table: "Users");

            migrationBuilder.AddColumn<int>(
                name: "MovieEntityId",
                table: "MovieReactions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MovieReactions_MovieEntityId",
                table: "MovieReactions",
                column: "MovieEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_MovieReactions_Movies_MovieEntityId",
                table: "MovieReactions",
                column: "MovieEntityId",
                principalTable: "Movies",
                principalColumn: "Id");
        }
    }
}
