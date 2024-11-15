﻿using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealTimePollingApp.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToVotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "Votes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Votes");
        }
    }
}