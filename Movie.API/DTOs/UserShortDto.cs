namespace Movie.API.DTOs
{
    public class UserShortDto
    {
        public int Id { get; set; }
        public string? Username { get; set; }
        public string? AvatarUrl { get; set; }
        public bool IsFollowing { get; set; }
    }
}
