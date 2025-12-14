namespace Movie.API.DTOs
{
    public class UserUpdateDto
    {
        public string? Username { get; set; }
        public IFormFile? Avatar { get; set; }
        public bool DeleteAvatar { get; set; }
    }
}
