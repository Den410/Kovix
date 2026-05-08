using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class AddNestedPosts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentPostId",
                table: "ForumPosts",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$DUefWIA8j.yflglUYhgCmeqf4Iz1B09KEHazxlRgKlTVRDlqCUosi");

            migrationBuilder.CreateIndex(
                name: "IX_ForumPosts_ParentPostId",
                table: "ForumPosts",
                column: "ParentPostId");

            migrationBuilder.AddForeignKey(
                name: "FK_ForumPosts_ForumPosts_ParentPostId",
                table: "ForumPosts",
                column: "ParentPostId",
                principalTable: "ForumPosts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ForumPosts_ForumPosts_ParentPostId",
                table: "ForumPosts");

            migrationBuilder.DropIndex(
                name: "IX_ForumPosts_ParentPostId",
                table: "ForumPosts");

            migrationBuilder.DropColumn(
                name: "ParentPostId",
                table: "ForumPosts");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$o8MO1sfY2C7v4YKcCqdhSevO.WDsWPXvo9vFoFNER8lR8yjR.j/6u");
        }
    }
}
