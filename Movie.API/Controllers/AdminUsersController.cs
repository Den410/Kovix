using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.DTOs;
using System.Security.Claims;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")] 
    public class AdminUsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminUsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.AvatarUrl,
                    u.CreatedAt
                })
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> ChangeUserRole(int id, [FromBody] ChangeRoleDto dto)
        {
            var validRoles = new[] { "User", "Reviewer", "Admin" };
            if (!validRoles.Contains(dto.NewRole))
            {
                return BadRequest("Невідома роль.");
            }

            var userToUpdate = await _context.Users.FindAsync(id);
            if (userToUpdate == null) return NotFound("Користувача не знайдено.");

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentUserId == id.ToString() && dto.NewRole != "Admin")
            {
                return BadRequest("Ви не можете зняти права адміністратора з власного акаунту.");
            }

            userToUpdate.Role = dto.NewRole;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Роль користувача {userToUpdate.Username} змінено на {dto.NewRole}." });
        }
    }
}