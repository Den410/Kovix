using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.AddColumn<string>(
                name: "AvatarUrl",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarUrl",
                table: "Users");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "PasswordHash", "Role", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2023, 1, 1, 10, 0, 0, 0, DateTimeKind.Utc), "fan@example.com", "$2a$11$Z5.z5.z5.z5.z5.z5.z5.z5.z5.z5.z5.z5.z5.z5.z5.z5.z5.z5", "User", "kino_fan" },
                    { 2, new DateTime(2023, 1, 5, 12, 0, 0, 0, DateTimeKind.Utc), "admin@movie.com", "$2a$11$a1.a1.a1.a1.a1.a1.a1.a1.a1.a1.a1.a1.a1.a1.a1.a1.a1.a1", "Admin", "admin" }
                });
        }
    }
}
