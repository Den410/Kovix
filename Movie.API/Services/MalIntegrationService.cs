using Microsoft.EntityFrameworkCore;
using Movie.API.Data;
using Movie.API.Models;
using Movie.API.Models.Jikan;
using System;
using System.Text.Json;
namespace Movie.API.Services
{
    public class MalIntegrationService
    {
        private readonly HttpClient _httpClient;
        private readonly ApplicationDbContext _context;

        public MalIntegrationService(HttpClient httpClient, ApplicationDbContext context)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "KovixApp");
            _context = context;
        }

        public async Task<bool> ImportCharactersAsync(int movieId, int malAnimeId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"https://api.jikan.moe/v4/anime/{malAnimeId}/characters");

                if (!response.IsSuccessStatusCode) return false;

                var jsonString = await response.Content.ReadAsStringAsync();
                var jikanData = JsonSerializer.Deserialize<JikanCharacterResponse>(jsonString);

                if (jikanData?.Data == null) return false;

                var topCharacters = jikanData.Data.Take(15).ToList();

                foreach (var item in topCharacters)
                {
                    var character = await _context.Characters
                        .FirstOrDefaultAsync(c => c.Name == item.Character.Name);

                    if (character == null)
                    {
                        character = new Character
                        {
                            Name = item.Character.Name,
                            ImageUrl = item.Character.Images.Jpg.ImageUrl
                        };
                        _context.Characters.Add(character);
                        await _context.SaveChangesAsync();
                    }

                    var jpActor = item.VoiceActors.FirstOrDefault(va => va.Language == "Japanese");

                    if (jpActor != null)
                    {
                        var actor = await _context.Actors
                            .FirstOrDefaultAsync(a => a.Name == jpActor.Person.Name);

                        if (actor == null)
                        {
                            actor = new Actor
                            {
                                Name = jpActor.Person.Name,
                                PhotoUrl = jpActor.Person.Images.Jpg.ImageUrl
                            };
                            _context.Actors.Add(actor);
                            await _context.SaveChangesAsync();
                        }

                        var roleExists = await _context.VoiceActingRoles.AnyAsync(r =>
                            r.MovieId == movieId &&
                            r.CharacterId == character.Id &&
                            r.ActorId == actor.Id);

                        if (!roleExists)
                        {
                            _context.VoiceActingRoles.Add(new VoiceActingRole
                            {
                                MovieId = movieId,
                                CharacterId = character.Id,
                                ActorId = actor.Id,
                                Language = "Japanese",
                                IsOriginal = true
                            });
                        }
                    }
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during import: {ex.Message}");
                return false;
            }
        }
    }
}
