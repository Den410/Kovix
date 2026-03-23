using System.Text.Json.Serialization;

namespace Movie.API.Models.Jikan
{
    public class JikanCharacterResponse
    {
        [JsonPropertyName("data")]
        public List<JikanCharacterData> Data { get; set; } = new();
    }
}
