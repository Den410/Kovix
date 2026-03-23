namespace Movie.API.DTOs
{
    public class CharacterResponseDto
    {
        public int CharacterId { get; set; }
        public string CharacterName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }

        public List<VoiceActorDto> VoiceActors { get; set; } = new List<VoiceActorDto>();
    }
}
