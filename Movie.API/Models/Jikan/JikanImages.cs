using System.Text.Json.Serialization;

namespace Movie.API.Models.Jikan
{
    public class JikanImages
    {
        [JsonPropertyName("jpg")]
        public JikanJpg Jpg { get; set; } = new();
    }
}
