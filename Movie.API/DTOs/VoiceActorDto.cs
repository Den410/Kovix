namespace Movie.API.DTOs
{
    public class VoiceActorDto
    {
        public int ActorId { get; set; }
        public string ActorName { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public string Language { get; set; } = string.Empty;
        public bool IsOriginal { get; set; }
        public bool IsMainRole { get; set; }
    }
}
