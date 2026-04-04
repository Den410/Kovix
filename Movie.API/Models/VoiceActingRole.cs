namespace Movie.API.Models
{
    public class VoiceActingRole
    {
        public int Id { get; set; }

        public int MovieId { get; set; }
        public MovieEntity Movie { get; set; } = null!; 

        public int CharacterId { get; set; }
        public Character Character { get; set; } = null!;

        public int ActorId { get; set; } 
        public Actor Actor { get; set; } = null!;

        public string Language { get; set; } = string.Empty;
        public bool IsOriginal { get; set; }
        public bool IsMainRole { get; set; }
    }
}