using System.Text.Json.Serialization;

namespace Movie.API.Models.Jikan
{
    public class JikanCharacterData
    {
        [JsonPropertyName("character")]
        public JikanEntity Character { get; set; } = new();

        [JsonPropertyName("role")]
        public string? Role { get; set; }

        [JsonPropertyName("voice_actors")]
        public List<JikanVoiceActor> VoiceActors { get; set; } = new();
    }
}
