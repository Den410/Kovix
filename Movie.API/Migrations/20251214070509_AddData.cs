using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class AddData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Movies",
                columns: new[] { "Id", "AverageRating", "CreatedAt", "Description", "Director", "Genre", "PosterUrl", "Title", "TotalReviews", "TrailerUrl", "Year" },
                values: new object[,]
                {
                    { 1, 9.0, new DateTime(2023, 5, 1, 0, 0, 0, 0, DateTimeKind.Utc), "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", "Christopher Nolan", "Sci-Fi", "https://image.tmdb.org/t/p/original/9gk7admal4zlWH9O46GGyEBDddp.jpg", "Inception", 2, "https://www.youtube.com/embed/YoHD9XEInc0", 2010 },
                    { 2, 10.0, new DateTime(2023, 5, 2, 0, 0, 0, 0, DateTimeKind.Utc), "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", "Frank Darabont", "Drama", "https://image.tmdb.org/t/p/original/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", "The Shawshank Redemption", 1, "https://www.youtube.com/embed/6hB3S9bIaco", 1994 },
                    { 3, 8.0, new DateTime(2024, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.", "Denis Villeneuve", "Sci-Fi", "https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg", "Dune: Part Two", 1, "https://www.youtube.com/embed/Way9Dexny3w", 2024 },
                    { 4, 9.5, new DateTime(2023, 6, 15, 0, 0, 0, 0, DateTimeKind.Utc), "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", "Christopher Nolan", "Action", "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg", "The Dark Knight", 0, "https://www.youtube.com/embed/EXeTwQWrcwY", 2008 }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "PasswordHash", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2023, 1, 1, 10, 0, 0, 0, DateTimeKind.Utc), "fan@example.com", "hashed_password_123", "kino_fan" },
                    { 2, new DateTime(2023, 1, 5, 12, 0, 0, 0, DateTimeKind.Utc), "admin@movie.com", "admin_pass_secure", "admin" }
                });

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
                columns: new[] { "Id", "AddedAt", "IsFavorite", "IsWatched", "MovieId", "UserId" },
                values: new object[] { 1, new DateTime(2024, 3, 1, 10, 0, 0, 0, DateTimeKind.Utc), true, false, 3, 1 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Movies",
                keyColumn: "Id",
                keyValue: 4);

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

            migrationBuilder.DeleteData(
                table: "Movies",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Movies",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Movies",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
