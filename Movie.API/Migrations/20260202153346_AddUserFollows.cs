using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserFollows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserFollow",
                columns: table => new
                {
                    ObserverId = table.Column<int>(type: "int", nullable: false),
                    TargetId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFollow", x => new { x.ObserverId, x.TargetId });
                    table.ForeignKey(
                        name: "FK_UserFollow_Users_ObserverId",
                        column: x => x.ObserverId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserFollow_Users_TargetId",
                        column: x => x.TargetId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserFollow_TargetId",
                table: "UserFollow",
                column: "TargetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserFollow");
        }
    }
}
