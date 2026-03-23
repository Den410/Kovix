namespace Movie.API.DTOs
{
    public class CreateCharacterWithRolesDto
    {
        public string CharacterName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public List<AssignVoiceActorDto> VoiceActors { get; set; } = new List<AssignVoiceActorDto>();
    }
}
