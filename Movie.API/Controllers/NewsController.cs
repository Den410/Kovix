using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.Models;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public NewsController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.News
                .OrderByDescending(n => n.IsPinned)
                .ThenByDescending(n => n.CreatedAt)
                .ToListAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(NewsItem news)
        {
            news.CreatedAt = DateTime.UtcNow;
            _context.News.Add(news);
            await _context.SaveChangesAsync();
            return Ok(news);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.News.FindAsync(id);
            if (item == null) return NotFound();
            _context.News.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, NewsItem updatedNews)
        {
            var item = await _context.News.FindAsync(id);
            if (item == null) return NotFound();

            item.Title = updatedNews.Title;
            item.Content = updatedNews.Content;
            item.Category = updatedNews.Category;
            item.IsPinned = updatedNews.IsPinned;
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _context.News.FindAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }
    }
}