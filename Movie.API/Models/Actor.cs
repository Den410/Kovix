namespace Movie.API.Models
{
    public class Actor
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Bio { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? PhotoUrl { get; set; } 
        public List<MovieActor> MovieActors { get; set; } = new List<MovieActor>();
    }
}
