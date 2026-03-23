using System.Text.Json.Serialization;

namespace Movie.API.Models.Jikan
{
    public class JikanJpg
    {
        [JsonPropertyName("image_url")]
        public string ImageUrl { get; set; } = string.Empty;
    }
}
