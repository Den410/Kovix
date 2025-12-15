using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Models;

namespace Movie.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MoviesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<MovieEntity>>> GetAll(
              [FromQuery] string? search,
              [FromQuery] string? genres,
              [FromQuery] int page = 1,
              [FromQuery] int pageSize = 8)
        {
            var query = _context.Movies.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(m => m.Title.ToLower().Contains(searchLower));
            }

            if (!string.IsNullOrWhiteSpace(genres))
            {
                var genreList = genres.ToLower().Split(',', StringSplitOptions.RemoveEmptyEntries);
                query = query.Where(m => genreList.Any(g => m.Genre != null && m.Genre.ToLower().Contains(g.Trim())));
            }

            int totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new PagedResult<MovieEntity>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MovieEntity>> GetById(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound();
            return movie;
        }

        [HttpGet("trending")]
        public async Task<ActionResult<IEnumerable<MovieEntity>>> GetTrending()
        {
            return await _context.Movies.OrderByDescending(m => m.TotalReviews).Take(4).ToListAsync();
        }

        [HttpGet("top-rated")]
        public async Task<ActionResult<IEnumerable<MovieEntity>>> GetTopRated()
        {
            return await _context.Movies.OrderByDescending(m => m.AverageRating).Take(4).ToListAsync();
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MovieEntity>> Create(CreateMovieDto dto)
        {
            var movie = new MovieEntity
            {
                Title = dto.Title,
                Description = dto.Description,
                Year = dto.Year,
                Genre = dto.Genre,
                Director = dto.Director,
                PosterUrl = dto.PosterUrl,
                TrailerUrl = dto.TrailerUrl,
                CreatedAt = DateTime.UtcNow,
                AverageRating = 0,
                TotalReviews = 0
            };

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = movie.Id }, movie);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, CreateMovieDto dto)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound();

            movie.Title = dto.Title;
            movie.Description = dto.Description;
            movie.Year = dto.Year;
            movie.Genre = dto.Genre;
            movie.Director = dto.Director;
            movie.PosterUrl = dto.PosterUrl;
            movie.TrailerUrl = dto.TrailerUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null) return NotFound();

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("new")]
        public async Task<ActionResult<IEnumerable<MovieEntity>>> GetNew()
        {
            return await _context.Movies
                .OrderByDescending(m => m.CreatedAt) 
                .Take(10)
                .ToListAsync();
        }
    }
}