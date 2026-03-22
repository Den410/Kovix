namespace Movie.API.Models
{
    public class MovieActor
    {
        public int MovieId { get; set; }
        public MovieEntity? Movie { get; set; }
        public int ActorId { get; set; }
        public Actor? Actor { get; set; }

        public string? Role { get; set; } 
        public int Order { get; set; }
        public bool IsMainRole { get; set; }
    }
}
