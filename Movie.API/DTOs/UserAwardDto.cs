namespace Movie.API.DTOs
{
    public class UserAwardDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime IssuedAt { get; set; }
    }
}
