namespace Movie.API.DTOs
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? AvatarUrl { get; set; } 
        public DateTime CreatedAt { get; set; }
    }
}
