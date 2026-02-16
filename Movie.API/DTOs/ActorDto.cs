namespace Movie.API.DTOs
{
    public class ActorDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Bio { get; set; }
        public DateTime? BirthDate { get; set; }
        public string? PhotoUrl { get; set; }
        public List<ActorMovieDto> Movies { get; set; } = new List<ActorMovieDto>();
    }
}
