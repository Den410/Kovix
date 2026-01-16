using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Movie.API.Migrations
{
    /// <inheritdoc />
    public partial class FixReport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
           /* migrationBuilder.CreateIndex(
                name: "IX_Reports_MessageId",
                table: "Reports",
                column: "MessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reports_Messages_MessageId",
                table: "Reports",
                column: "MessageId",
                principalTable: "Messages",
                principalColumn: "Id");*/
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reports_Messages_MessageId",
                table: "Reports");

            migrationBuilder.DropIndex(
                name: "IX_Reports_MessageId",
                table: "Reports");
        }
    }
}
