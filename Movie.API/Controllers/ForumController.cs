using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Models;
using System.Security.Claims;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForumController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMemoryCache _cache;

        public ForumController(ApplicationDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<ForumCategoryDto>>> GetCategories()
        {
            var categories = await _context.ForumCategories
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new ForumCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    TopicsCount = c.Topics.Count
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("categories/{categoryId}/topics")]
        public async Task<ActionResult<IEnumerable<ForumTopicPreviewDto>>> GetTopicsByCategory(int categoryId)
        {
            var topics = await _context.ForumTopics
                .Where(t => t.CategoryId == categoryId)
                .Include(t => t.User)
                .Include(t => t.Posts)
                .OrderByDescending(t => t.IsPinned) 
                .ThenByDescending(t => t.UpdatedAt)
                .Select(t => new ForumTopicPreviewDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    AuthorName = t.User!.Username,
                    CreatedAt = t.CreatedAt,
                    RepliesCount = t.Posts.Count - 1, 
                    ViewsCount = t.ViewsCount,
                    IsPinned = t.IsPinned,
                    IsClosed = t.IsClosed
                })
                .ToListAsync();

            return Ok(topics);
        }

        [HttpGet("topics/{topicId}")]
        public async Task<ActionResult> GetTopic(int topicId)
        {
            var topic = await _context.ForumTopics
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == topicId);

            if (topic == null) return NotFound("Тему не знайдено");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var viewerId = userId ?? HttpContext.Connection.RemoteIpAddress?.ToString() ?? "guest";

            var cacheKey = $"view_topic_{topicId}_{viewerId}";

            if (!_cache.TryGetValue(cacheKey, out _))
            {
                topic.ViewsCount++;
                await _context.SaveChangesAsync();

                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromHours(1));

                _cache.Set(cacheKey, true, cacheOptions);
            }

            var posts = await _context.ForumPosts
                .Where(p => p.TopicId == topicId)
                .Include(p => p.User)
                .OrderBy(p => p.CreatedAt)
                .Select(p => new ForumPostDto
                {
                    Id = p.Id,
                    Content = p.Content,
                    AuthorId = p.UserId,
                    AuthorName = p.User!.Username,
                    AuthorAvatarUrl = p.User.AvatarUrl,
                    AuthorRole = p.User.Role,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                topic.Id,
                topic.Title,
                topic.IsClosed,
                CategoryName = topic.Category?.Name,
                Posts = posts
            });
        }

        [HttpPost("topics")]
        [Authorize]
        public async Task<ActionResult> CreateTopic([FromBody] CreateTopicDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var category = await _context.ForumCategories.FindAsync(dto.CategoryId);
            if (category == null) return NotFound("Категорію не знайдено");

            var topic = new ForumTopic
            {
                CategoryId = dto.CategoryId,
                UserId = userId,
                Title = dto.Title,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ForumTopics.Add(topic);
            await _context.SaveChangesAsync(); 

            var firstPost = new ForumPost
            {
                TopicId = topic.Id,
                UserId = userId,
                Content = dto.FirstPostContent,
                CreatedAt = DateTime.UtcNow
            };

            _context.ForumPosts.Add(firstPost);
            await _context.SaveChangesAsync();

            return Ok(new { topicId = topic.Id, message = "Тему створено!" });
        }

        [HttpPost("topics/{topicId}/posts")]
        [Authorize]
        public async Task<ActionResult> CreatePost(int topicId, [FromBody] CreatePostDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var topic = await _context.ForumTopics.FindAsync(topicId);
            if (topic == null) return NotFound("Тему не знайдено");

            if (topic.IsClosed) return BadRequest("Ця тема закрита для обговорення.");

            var post = new ForumPost
            {
                TopicId = topicId,
                UserId = userId,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.ForumPosts.Add(post);

            topic.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Відповідь додано!" });
        }
    }
}