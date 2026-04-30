using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCriticReviewRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Reviews",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Watchlists",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.CreateTable(
                name: "CriticReviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MovieId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    StoryScore = table.Column<int>(type: "int", nullable: false),
                    ActingScore = table.Column<int>(type: "int", nullable: false),
                    VisualsScore = table.Column<int>(type: "int", nullable: false),
                    AudioScore = table.Column<int>(type: "int", nullable: false),
                    Verdict = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    FullText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CriticReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CriticReviews_Movies_MovieId",
                        column: x => x.MovieId,
                        principalTable: "Movies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CriticReviews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CriticReviews_MovieId",
                table: "CriticReviews",
                column: "MovieId");

            migrationBuilder.CreateIndex(
                name: "IX_CriticReviews_UserId",
                table: "CriticReviews",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CriticReviews");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.InsertData(
                table: "Reviews",
                columns: new[] { "Id", "Comment", "CreatedAt", "MovieId", "Rating", "UserId" },
                values: new object[,]
                {
                    { 1, "Masterpiece! Nolan is a genius.", new DateTime(2023, 6, 1, 14, 30, 0, 0, DateTimeKind.Utc), 1, 10, 1 },
                    { 2, "Great visuals, but a bit confusing.", new DateTime(2023, 6, 2, 10, 0, 0, 0, DateTimeKind.Utc), 1, 8, 2 },
                    { 3, "The best movie ever made.", new DateTime(2023, 6, 5, 9, 15, 0, 0, DateTimeKind.Utc), 2, 10, 1 },
                    { 4, "Amazing sound design.", new DateTime(2024, 3, 5, 18, 20, 0, 0, DateTimeKind.Utc), 3, 8, 2 }
                });

            migrationBuilder.InsertData(
                table: "Watchlists",
                columns: new[] { "Id", "AddedAt", "IsFavorite", "MovieId", "Status", "UserId" },
                values: new object[] { 1, new DateTime(2024, 3, 1, 10, 0, 0, 0, DateTimeKind.Utc), true, 3, 0, 1 });
        }
    }
}
