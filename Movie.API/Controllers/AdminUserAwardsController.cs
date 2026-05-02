using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Models;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminUserAwardsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminUserAwardsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> IssueAward([FromBody] UserAwardCreateDto dto)
        {
            var user = await _context.Users.FindAsync(dto.UserId);
            if (user == null) return NotFound("Користувача не знайдено.");

                var award = new UserAward
                {
                    UserId = dto.UserId,
                    Name = dto.Name,
                    Icon = dto.Icon,
                    Description = dto.Description
                };

            _context.UserAwards.Add(award);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Ачівку успішно видано!" });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditAward(int id, [FromBody] UserAwardCreateDto dto)
        {
            Console.WriteLine($"Редагування ачівки: ID={id}, Name={dto.Name}");

            var award = await _context.UserAwards.FindAsync(id);
            if (award == null)
            {
                Console.WriteLine($"Ачівку не знайдено: {id}");
                return NotFound("Нагороду не знайдено.");
            }

            award.Name = dto.Name;
            award.Icon = dto.Icon;
            award.Description = dto.Description;

            await _context.SaveChangesAsync();
            
            Console.WriteLine($"Ачівку оновлено: {id}");
            return Ok(new { message = "Ачівку оновлено!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveAward(int id)
        {
            Console.WriteLine($"Видалення ачівки: ID={id}");

            var award = await _context.UserAwards.FindAsync(id);
            if (award == null)
            {
                Console.WriteLine($"Ачівку не знайдено: {id}");
                return NotFound("Нагороду не знайдено.");
            }

            _context.UserAwards.Remove(award);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"Ачівку видалено: {id}");
            return Ok(new { message = "Ачівку видалено." });
        }
    }
}