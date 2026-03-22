namespace Movie.API.DTOs
{
    public class CastDto
    {
        public int ActorId { get; set; }
        public string? Name { get; set; }
        public string? Role { get; set; }
        public string? Biography { get; set; }
        public string? PhotoUrl { get; set; }
        public bool IsMainRole { get; set; }
        public DateTime? BirthDate { get; set; }
    }
}
