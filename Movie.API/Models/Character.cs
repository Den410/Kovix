namespace Movie.API.Models
{
    public class Character
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public ICollection<VoiceActingRole> VoiceActors { get; set; } = new List<VoiceActingRole>();
    }
}
