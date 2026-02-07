using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class ChangeLogic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Episode_Movies_MovieId",
                table: "Episode");

            migrationBuilder.DropForeignKey(
                name: "FK_UserEpisodeRatings_Episode_EpisodeId",
                table: "UserEpisodeRatings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Episode",
                table: "Episode");

            migrationBuilder.RenameTable(
                name: "Episode",
                newName: "Episodes");

            migrationBuilder.RenameIndex(
                name: "IX_Episode_MovieId_SeasonNumber_EpisodeNumber",
                table: "Episodes",
                newName: "IX_Episodes_MovieId_SeasonNumber_EpisodeNumber");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Episodes",
                table: "Episodes",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Episodes_Movies_MovieId",
                table: "Episodes",
                column: "MovieId",
                principalTable: "Movies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserEpisodeRatings_Episodes_EpisodeId",
                table: "UserEpisodeRatings",
                column: "EpisodeId",
                principalTable: "Episodes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Episodes_Movies_MovieId",
                table: "Episodes");

            migrationBuilder.DropForeignKey(
                name: "FK_UserEpisodeRatings_Episodes_EpisodeId",
                table: "UserEpisodeRatings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Episodes",
                table: "Episodes");

            migrationBuilder.RenameTable(
                name: "Episodes",
                newName: "Episode");

            migrationBuilder.RenameIndex(
                name: "IX_Episodes_MovieId_SeasonNumber_EpisodeNumber",
                table: "Episode",
                newName: "IX_Episode_MovieId_SeasonNumber_EpisodeNumber");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Episode",
                table: "Episode",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Episode_Movies_MovieId",
                table: "Episode",
                column: "MovieId",
                principalTable: "Movies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserEpisodeRatings_Episode_EpisodeId",
                table: "UserEpisodeRatings",
                column: "EpisodeId",
                principalTable: "Episode",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
