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
    public class CharactersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CharactersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var character = await _context.Characters.FirstOrDefaultAsync(c => c.Id == id);
            if (character == null) return NotFound("Персонажа не знайдено");

            var roles = await _context.VoiceActingRoles
                .Include(v => v.Actor)
                .Include(v => v.Movie)
                .Where(v => v.CharacterId == id)
                .ToListAsync();

            var result = new
            {
                character.Id,
                character.Name,
                character.ImageUrl,
                VoiceActors = roles.Select(v => new
                {
                    v.ActorId,
                    v.Actor?.Name,
                    v.Actor?.PhotoUrl,
                    v.Language,
                    v.IsOriginal,
                    v.IsMainRole,
                    v.MovieId,
                    v.Movie?.Title
                }).ToList()
            };

            return Ok(result);
        }

        [HttpGet("/api/movies/{movieId}/characters")]
        public async Task<ActionResult<IEnumerable<CharacterResponseDto>>> GetMovieCharacters(int movieId)
        {
            var movieExists = await _context.Movies.AnyAsync(m => m.Id == movieId);
            if (!movieExists) return NotFound("Фільм не знайдено");

            var characters = await _context.VoiceActingRoles
                .Include(v => v.Character)
                .Include(v => v.Actor)
                .Where(v => v.MovieId == movieId)
                .GroupBy(v => new { v.Character.Id, v.Character.Name, v.Character.ImageUrl })
                .Select(g => new CharacterResponseDto
                {
                    CharacterId = g.Key.Id,
                    CharacterName = g.Key.Name,
                    ImageUrl = g.Key.ImageUrl,
                    VoiceActors = g.Select(v => new VoiceActorDto
                    {
                        ActorId = v.Actor.Id,
                        ActorName = v.Actor.Name,
                        Language = v.Language,
                        IsOriginal = v.IsOriginal,
                        IsMainRole = v.IsMainRole,
                        PhotoUrl = v.Actor.PhotoUrl
                    }).ToList()
                })
                .ToListAsync();

            return Ok(characters);
        }

        [HttpPost("/api/movies/{movieId}/characters")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddCharacterToMovie(int movieId, [FromBody] CreateCharacterWithRolesDto dto)
        {
            var movieExists = await _context.Movies.AnyAsync(m => m.Id == movieId);
            if (!movieExists) return NotFound("Фільм не знайдено");

            var newCharacter = new Character
            {
                Name = dto.CharacterName,
                ImageUrl = dto.ImageUrl
            };

            _context.Characters.Add(newCharacter);
            await _context.SaveChangesAsync();

            var rolesToAdd = new List<VoiceActingRole>();
            foreach (var actorRole in dto.VoiceActors)
            {
                var personExists = await _context.Actors.AnyAsync(p => p.Id == actorRole.PersonId);
                if (personExists)
                {
                    rolesToAdd.Add(new VoiceActingRole
                    {
                        MovieId = movieId,
                        CharacterId = newCharacter.Id,
                        ActorId = actorRole.PersonId,
                        Language = actorRole.Language,
                        IsOriginal = actorRole.IsOriginal
                    });
                }
            }

            if (rolesToAdd.Any())
            {
                _context.VoiceActingRoles.AddRange(rolesToAdd);
                await _context.SaveChangesAsync();
            }

            return Ok(new { Message = "Персонажа успішно додано!", newCharacter.Id });
        }

        [HttpPut("/api/movies/{movieId}/characters/{characterId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCharacter(int movieId, int characterId, [FromBody] CreateCharacterWithRolesDto dto)
        {
            var character = await _context.Characters.FindAsync(characterId);
            if (character == null) return NotFound("Персонажа не знайдено");

            character.Name = dto.CharacterName;
            character.ImageUrl = dto.ImageUrl;

            var existingRoles = await _context.VoiceActingRoles
                .Where(v => v.MovieId == movieId && v.CharacterId == characterId)
                .ToListAsync();

            _context.VoiceActingRoles.RemoveRange(existingRoles);

            var rolesToAdd = new List<VoiceActingRole>();
            if (dto.VoiceActors != null)
            {
                foreach (var actorRole in dto.VoiceActors)
                {
                    if (await _context.Actors.AnyAsync(p => p.Id == actorRole.PersonId))
                    {
                        rolesToAdd.Add(new VoiceActingRole
                        {
                            MovieId = movieId,
                            CharacterId = character.Id,
                            ActorId = actorRole.PersonId,
                            Language = actorRole.Language,
                            IsOriginal = actorRole.IsOriginal
                        });
                    }
                }
            }

            if (rolesToAdd.Any()) _context.VoiceActingRoles.AddRange(rolesToAdd);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("/api/movies/{movieId}/characters/{characterId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCharacter(int movieId, int characterId)
        {
            var roles = await _context.VoiceActingRoles
                .Where(v => v.MovieId == movieId && v.CharacterId == characterId)
                .ToListAsync();

            if (!roles.Any()) return NotFound("Ролей для цього персонажа в цьому фільмі не знайдено");

            _context.VoiceActingRoles.RemoveRange(roles);

            var isUsedElsewhere = await _context.VoiceActingRoles
                .AnyAsync(v => v.CharacterId == characterId && v.MovieId != movieId);

            if (!isUsedElsewhere)
            {
                var character = await _context.Characters.FindAsync(characterId);
                if (character != null) _context.Characters.Remove(character);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}