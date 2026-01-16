using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Hubs;
using Movie.API.Models;
using System.Security.Claims;
namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public ReportsController(ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllReports()
        {
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (userRole != "Admin") return Forbid("Тільки адміністратори мають доступ.");

            var reports = await _context.Reports
                .Include(r => r.Sender)
                .Include(r => r.ReportedUser)
                .Include(r => r.Message) 
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    SenderName = r.Sender.Username,
                    r.SenderId,
                    ReportedUserName = r.ReportedUser.Username,
                    r.ReportedUserId,
                    r.Reason,
                    r.MessageId,
                    r.MessageSnapshot,
                    r.CreatedAt,
                    r.IsResolved,
                    IsGeneralChat = r.Message != null && r.Message.ReceiverId == null
                })
                .ToListAsync();

            return Ok(reports);
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateReport([FromBody] ReportDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(new { message = "Невалідні дані", errors });
                }

                var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                   ?? User.FindFirstValue("UserId")
                                   ?? User.FindFirstValue("sub"); 

                if (string.IsNullOrEmpty(userIdString))
                {
                    return Unauthorized(new { message = "Не вдалося визначити ID користувача з токена." });
                }

                if (!int.TryParse(userIdString, out int senderId))
                {
                    return BadRequest(new { message = "Помилка формату ID у токені." });
                }

                if (senderId == model.ReportedUserId)
                    return BadRequest(new { message = "Не можна скаржитись на себе" });

                var reportedUser = await _context.Users.FindAsync(model.ReportedUserId);
                if (reportedUser == null)
                    return BadRequest(new { message = "Користувача для скарги не знайдено." });

                if (model.MessageId.HasValue)
                {
                    var messageExists = await _context.Messages.AnyAsync(m => m.Id == model.MessageId.Value);
                    if (!messageExists) return BadRequest(new { message = "Повідомлення для скарги не знайдено." });
                }

                var report = new Report
                {
                    SenderId = senderId,
                    ReportedUserId = model.ReportedUserId,
                    Reason = model.Reason,
                    MessageId = model.MessageId,
                    MessageSnapshot = model.Content,
                    CreatedAt = DateTime.UtcNow 
                };

                _context.Reports.Add(report);

                var admins = await _context.Users
                    .Where(u => u.Role == "Admin")
                    .ToListAsync();

                var adminMessage = $"Скарга на: '{model.Content}'. Причина: {model.Reason}";


                if (admins == null || !admins.Any())
                {
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Скаргу збережено (адмінів не знайдено)." });
                }

                foreach (var admin in admins)
                {
                    var notification = new Notification
                    {
                        UserId = admin.Id,
                        Message = adminMessage,
                        CreatedAt = DateTime.UtcNow,
                        IsRead = false
                    };

                    _context.Notifications.Add(notification);

                    await _context.SaveChangesAsync();

                    if (_hubContext != null)
                    {
                        var payload = new
                        {
                            notification.Id,
                            notification.UserId,
                            notification.Message,
                            notification.IsRead,
                            notification.CreatedAt
                        };

                        await _hubContext.Clients.User(admin.Id.ToString())
                                         .SendAsync("ReceiveNotification", payload);
                    }
                }

                return Ok(new { message = "Скаргу відправлено" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateReport: {ex.Message}");

                return StatusCode(500, new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}