using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Models;
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

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }

        [HttpGet("general")]
        public async Task<IActionResult> GetGeneralHistory()
        {
            var userId = GetUserId();

            var msgs = await _context.Messages
                .AsNoTracking()
                .Where(m => m.ReceiverId == null && !m.IsDeleted)
                .OrderByDescending(m => m.Timestamp)
                .Take(50)
                .OrderBy(m => m.Timestamp)
                .Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.Timestamp,
                    m.SenderId,
                    SenderName = m.Sender.Username,
                    m.IsEdited,
                    IsRead = _context.MessageReadStatuses.Any(r => r.MessageId == m.Id && r.UserId == userId && r.IsRead)
                })
                .ToListAsync();

            return Ok(msgs);
        }

        [HttpPost("general/read")]
        public async Task<IActionResult> MarkGeneralAsRead()
        {
            var userId = GetUserId();

            var unread = await _context.Messages
                .Where(m => m.ReceiverId == null && !m.IsDeleted)
                .Where(m => !_context.MessageReadStatuses.Any(r => r.MessageId == m.Id && r.UserId == userId && r.IsRead))
                .ToListAsync();

            foreach (var msg in unread)
            {
                _context.MessageReadStatuses.Add(new MessageReadStatus
                {
                    MessageId = msg.Id,
                    UserId = userId,
                    IsRead = true
                });
            }

            await _context.SaveChangesAsync();

            return Ok();
        }


        [HttpGet("private/{userId}")]
        public async Task<IActionResult> GetPrivateHistory(int userId)
        {
            var currentUserId = GetUserId();

            var msgs = await _context.Messages
                .AsNoTracking()
                .Where(m =>
                    !m.IsDeleted &&
                    !m.DeletedFor.Any(d => d.UserId == currentUserId) &&
                    (
                        (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                        (m.SenderId == userId && m.ReceiverId == currentUserId)
                    )
                )
                .Include(m => m.Sender)
                .OrderByDescending(m => m.Timestamp)
                .Take(50)
                .OrderBy(m => m.Timestamp)
                .Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.Timestamp,
                    m.SenderId,
                    SenderName = m.Sender.Username,
                    ReceiverId = m.ReceiverId,
                    m.IsEdited
                })
                .ToListAsync();

            return Ok(msgs);
        }

        [HttpDelete("messages/{id}/me")]
        public async Task<IActionResult> DeleteForMe(int id)
        {
            var userId = GetUserId();

            var messageExists = await _context.Messages
                .AnyAsync(m => m.Id == id);

            if (!messageExists)
                return NotFound();

            var exists = await _context.MessageDelete
                .AnyAsync(x => x.MessageId == id && x.UserId == userId);

            if (!exists)
            {
                _context.MessageDelete.Add(new MessageDelete
                {
                    MessageId = id,
                    UserId = userId
                });

                await _context.SaveChangesAsync();
            }

            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("messages/{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var msg = await _context.Messages.FindAsync(id);
            if (msg == null) return NotFound();

            msg.IsDeleted = true;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPut("messages/{id}")]
        public async Task<IActionResult> EditMessage(int id, [FromBody] EditMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();

            var msg = await _context.Messages.FindAsync(id);
            if (msg == null) return NotFound();

            if (msg.SenderId != userId)
                return Forbid();

            msg.Content = dto.Content.Trim();
            msg.IsEdited = true;

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("messages/read/{senderId}")]
        public async Task<IActionResult> MarkMessagesAsRead(int senderId)
        {
            var myId = GetUserId();

            var unreadMessages = await _context.Messages
                .Where(m => m.SenderId == senderId && m.ReceiverId == myId && !m.IsRead)
                .ToListAsync();

            if (unreadMessages.Any())
            {
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                }

                await _context.SaveChangesAsync();
            }

            return Ok(new { count = unreadMessages.Count });
        }
    }
}
