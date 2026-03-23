using System.Text.Json.Serialization;

namespace Movie.API.Models.Jikan
{
    public class JikanVoiceActor
    {
        [JsonPropertyName("person")]
        public JikanEntity Person { get; set; } = new();

        [JsonPropertyName("language")]
        public string Language { get; set; } = string.Empty;
    }
}
