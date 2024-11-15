using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealTimePollingApp.Migrations
{
    /// <inheritdoc />
    public partial class AddUserNameToVotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "Votes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserName",
                table: "Votes");
        }
    }
}
