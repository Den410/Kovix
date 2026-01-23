using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.DTOs;
using Movie.API.Models;
using Movie.API.Models.Enums;
using System.Security.Claims;

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
        [FromQuery] int? year,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 8)
        {
            var query = _context.Movies.AsQueryable();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                var userId = int.Parse(userIdClaim.Value);
                var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);

                if (user != null && !string.IsNullOrEmpty(user.BlockedGenres))
                {
                    var blockedList = user.BlockedGenres.Split(',', StringSplitOptions.RemoveEmptyEntries);

                    foreach (var blocked in blockedList)
                    {
                        var b = blocked.Trim();
                        query = query.Where(m => m.Genre == null || !m.Genre.ToLower().Contains(b));
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(m => m.Title.ToLower().Contains(searchLower));
            }

            if (year.HasValue)
            {
                query = query.Where(m => m.Year == year.Value);
            }

            if (!string.IsNullOrWhiteSpace(genres))
            {
                var genreList = genres.ToLower().Split(',', StringSplitOptions.RemoveEmptyEntries);
                foreach (var genre in genreList)
                {
                    var g = genre.Trim();
                    query = query.Where(m => m.Genre != null && m.Genre.ToLower().Contains(g));
                }
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
        public async Task<ActionResult<MovieDetailDto>> GetById(int id)
        {
            int? currentUserId = null;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null) currentUserId = int.Parse(userIdClaim.Value);

            var movie = await _context.Movies
                .Include(m => m.Reviews)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (movie == null) return NotFound();

            var reactions = await _context.MovieReactions
                .Where(r => r.MovieId == id)
                .ToListAsync();

            var myReactions = currentUserId.HasValue
                ? reactions.Where(r => r.UserId == currentUserId.Value).ToList()
                : new List<MovieReaction>();

            var dto = new MovieDetailDto
            {
                Id = movie.Id,
                Title = movie.Title,
                Description = movie.Description,
                Year = movie.Year,
                Genre = movie.Genre,
                Director = movie.Director,
                PosterUrl = movie.PosterUrl,
                TrailerUrl = movie.TrailerUrl,
                AverageRating = movie.AverageRating,
                TotalReviews = movie.Reviews?.Count ?? 0,

                ReactionCounts = reactions
                    .GroupBy(r => r.Type)
                    .ToDictionary(g => g.Key.ToString(), g => g.Count()),

                CurrentUserVote = (int?)myReactions
                    .FirstOrDefault(r => r.Type == ReactionType.Like || r.Type == ReactionType.Dislike)?.Type,

                CurrentUserEmotion = (int?)myReactions
                    .FirstOrDefault(r => r.Type != ReactionType.Like && r.Type != ReactionType.Dislike)?.Type
            };

            return Ok(dto);
        }

        [HttpPost("{id}/react")]
        [Authorize]
        public async Task<IActionResult> ReactToMovie(int id, [FromQuery] ReactionType type)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            bool isVoteGroup = (type == ReactionType.Like || type == ReactionType.Dislike);

            var existingReaction = await _context.MovieReactions
                .FirstOrDefaultAsync(r =>
                    r.MovieId == id &&
                    r.UserId == userId &&
                    (isVoteGroup
                        ? (r.Type == ReactionType.Like || r.Type == ReactionType.Dislike)
                        : (r.Type != ReactionType.Like && r.Type != ReactionType.Dislike))
                );

            if (existingReaction != null)
            {
                if (existingReaction.Type == type)
                {
                    _context.MovieReactions.Remove(existingReaction);
                }
                else
                {
                    existingReaction.Type = type;
                }
            }
            else
            {
                _context.MovieReactions.Add(new MovieReaction
                {
                    MovieId = id,
                    UserId = userId,
                    Type = type
                });
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("trending")]
        public async Task<ActionResult<IEnumerable<MovieEntity>>> GetTrending()
        {
            var blockedGenres = await GetUserBlockedGenres();
            var moviesQuery = _context.Movies.AsNoTracking().AsQueryable();

            foreach (var genre in blockedGenres)
            {
                moviesQuery = moviesQuery.Where(m => m.Genre == null || !m.Genre.ToLower().Contains(genre));
            }

            var trendingMovies = await _context.MovieReactions
                .Where(r => r.Type == ReactionType.Like)
                .GroupBy(r => r.MovieId)
                .Select(g => new
                {
                    MovieId = g.Key,
                    LikesCount = g.Count()
                })
                .OrderByDescending(x => x.LikesCount)
                .Take(10)
                .Join(
                    moviesQuery,
                    r => r.MovieId,
                    m => m.Id,
                    (r, m) => m
                )
                .Where(m => !string.IsNullOrEmpty(m.TrailerUrl))
                .ToListAsync();

            return Ok(trendingMovies);
        }


        [HttpGet("top-rated")]
        public async Task<ActionResult<IEnumerable<MovieDetailDto>>> GetTopRated()
        {
            var query = _context.Movies.AsNoTracking();

            var blockedGenres = await GetUserBlockedGenres();
            foreach (var genre in blockedGenres)
            {
                query = query.Where(m => m.Genre == null || !m.Genre.ToLower().Contains(genre));
            }

            var movies = await query
                .OrderByDescending(m => m.AverageRating)
                .Take(10)
                .Select(m => new MovieDetailDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    PosterUrl = m.PosterUrl,
                    Year = m.Year,
                    AverageRating = m.AverageRating,
                    Genre = m.Genre
                })
                .ToListAsync();

            return Ok(movies);
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
        public async Task<ActionResult<IEnumerable<MovieDetailDto>>> GetNew()
        {
            var query = _context.Movies.AsNoTracking();

            var blockedGenres = await GetUserBlockedGenres();
            foreach (var genre in blockedGenres)
            {
                query = query.Where(m => m.Genre == null || !m.Genre.ToLower().Contains(genre));
            }

            var movies = await query
                .OrderByDescending(m => m.CreatedAt) 
                .Take(10)
               .Select(m => new MovieDetailDto
               {
                   Id = m.Id,
                   Title = m.Title,
                   PosterUrl = m.PosterUrl,
                   Year = m.Year,
                   AverageRating = m.AverageRating,
                   Genre = m.Genre
               })
                .ToListAsync();

            return Ok(movies);
        }


        [HttpGet("filters")]
        public async Task<ActionResult<MovieFiltersDto>> GetFilters()
        {
            var rawData = await _context.Movies
                .AsNoTracking()
                .Select(m => new { m.Genre, m.Year })
                .ToListAsync();

            var genres = rawData
                .Where(m => !string.IsNullOrEmpty(m.Genre))
                .SelectMany(m => m.Genre.Split(','))
                .Select(g => g.Trim().ToLower())
                .Distinct()
                .OrderBy(g => g)
                .ToList();

            var years = rawData
                .Select(m => m.Year)
                .Distinct()
                .OrderByDescending(y => y)
                .ToList();

            return Ok(new MovieFiltersDto { Genres = genres, Years = years });
        }
        private async Task<List<string>> GetUserBlockedGenres()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return new List<string>();

            var userId = int.Parse(userIdClaim.Value);

            var userSettings = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => u.BlockedGenres)
                .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(userSettings)) return new List<string>();

            return userSettings.ToLower().Split(',', StringSplitOptions.RemoveEmptyEntries)
                               .Select(g => g.Trim())
                               .ToList();
        }
    }
}
