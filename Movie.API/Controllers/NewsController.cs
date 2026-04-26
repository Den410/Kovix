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
        private readonly ILogger<NewsController> _logger;

        public NewsController(ApplicationDbContext context, ILogger<NewsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Отримано запит на завантаження списку всіх новин.");

            var newsList = await _context.News
                .OrderByDescending(n => n.IsPinned)
                .ThenByDescending(n => n.CreatedAt)
                .ToListAsync();

            _logger.LogInformation("Успішно повернуто {NewsCount} новин.", newsList.Count);
            return Ok(newsList);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(NewsItem news)
        {
            _logger.LogInformation("Спроба створення нової новини з заголовком: {Title}", news.Title);

            news.CreatedAt = DateTime.UtcNow;
            _context.News.Add(news);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Новину успішно створено. Присвоєно ID: {NewsId}", news.Id);
            return Ok(news);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            _logger.LogInformation("Спроба видалення новини з ID: {NewsId}", id);

            var item = await _context.News.FindAsync(id);
            if (item == null)
            {
                _logger.LogWarning("Не вдалося видалити: Новину з ID: {NewsId} не знайдено.", id);
                return NotFound();
            }

            _context.News.Remove(item);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Новину з ID: {NewsId} успішно видалено.", id);
            return NoContent();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, NewsItem updatedNews)
        {
            _logger.LogInformation("Спроба оновлення новини з ID: {NewsId}", id);

            var item = await _context.News.FindAsync(id);
            if (item == null)
            {
                _logger.LogWarning("Не вдалося оновити: Новину з ID: {NewsId} не знайдено.", id);
                return NotFound();
            }

            item.Title = updatedNews.Title;
            item.Content = updatedNews.Content;
            item.Category = updatedNews.Category;
            item.IsPinned = updatedNews.IsPinned;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Новину з ID: {NewsId} успішно оновлено.", id);
            return Ok(item);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Запит на отримання детальної інформації про новину з ID: {NewsId}", id);

            var item = await _context.News.FindAsync(id);
            if (item == null)
            {
                _logger.LogWarning("Новину з ID: {NewsId} не знайдено.", id);
                return NotFound();
            }

            return Ok(item);
        }
    }
}