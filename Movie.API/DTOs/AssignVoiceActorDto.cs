namespace Movie.API.DTOs
{
    public class AssignVoiceActorDto
    {
        public int PersonId { get; set; }
        public string Language { get; set; } = string.Empty;
        public bool IsOriginal { get; set; }
    }
}
