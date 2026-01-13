using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using System.Security.Claims;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ChatController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("general")]
        public async Task<IActionResult> GetGeneralHistory()
        {
            var msgs = await _context.Messages
                .Where(m => m.ReceiverId == null)
                .Include(m => m.Sender)
                .OrderByDescending(m => m.Timestamp)
                .Take(50)
                .OrderBy(m => m.Timestamp)
                .Select(m => new {
                    m.Id,
                    m.Content,
                    m.Timestamp,
                    m.SenderId,
                    SenderName = m.Sender.Username,
                    m.ReceiverId
                })
                .ToListAsync();

            return Ok(msgs);
        }

        [HttpGet("private/{userId}")]
        public async Task<IActionResult> GetPrivateHistory(int userId)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var msgs = await _context.Messages
                .Where(m => (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                            (m.SenderId == userId && m.ReceiverId == currentUserId))
                .Include(m => m.Sender)
                .OrderByDescending(m => m.Timestamp)
                .Take(50)
                .OrderBy(m => m.Timestamp)
                .Select(m => new {
                    m.Id,
                    m.Content,
                    m.Timestamp,
                    m.SenderId,
                    SenderName = m.Sender.Username,
                    m.ReceiverId
                })
                .ToListAsync();

            return Ok(msgs);
        }
    }
}