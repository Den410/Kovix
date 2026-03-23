using System.Text.Json.Serialization;

namespace Movie.API.Models.Jikan
{
    public class JikanEntity
    {
        [JsonPropertyName("mal_id")]
        public int MalId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("images")]
        public JikanImages Images { get; set; } = new();
    }
}
