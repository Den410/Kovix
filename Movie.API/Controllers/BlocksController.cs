using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.Models;
using System.Security.Claims;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BlocksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BlocksController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("{userId}")]
        public async Task<IActionResult> BlockUser(int userId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            if (currentUserId == userId) return BadRequest("Не можна заблокувати себе");

            var existingBlock = await _context.UserBlocks
                .FirstOrDefaultAsync(b => b.BlockerId == currentUserId && b.BlockedId == userId);

            if (existingBlock != null) return Ok("Вже заблоковано");

            var block = new UserBlock
            {
                BlockerId = currentUserId,
                BlockedId = userId
            };
            _context.UserBlocks.Add(block);

            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.RequesterId == currentUserId && f.ReceiverId == userId) ||
                    (f.RequesterId == userId && f.ReceiverId == currentUserId));

            if (friendship != null)
            {
                _context.Friendships.Remove(friendship);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> UnblockUser(int userId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var block = await _context.UserBlocks
                .FirstOrDefaultAsync(b => b.BlockerId == currentUserId && b.BlockedId == userId);

            if (block != null)
            {
                _context.UserBlocks.Remove(block);
                await _context.SaveChangesAsync();
            }
            return Ok();
        }

        [HttpGet("check/{userId}")]
        public async Task<IActionResult> CheckBlock(int userId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var isBlocked = await _context.UserBlocks
                .AnyAsync(b => b.BlockerId == currentUserId && b.BlockedId == userId);

            return Ok(new { isBlocked });
        }
    }
}