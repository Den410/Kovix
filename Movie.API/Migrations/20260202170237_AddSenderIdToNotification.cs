using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSenderIdToNotification : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SenderId",
                table: "Notifications",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SenderId",
                table: "Notifications");
        }
    }
}
