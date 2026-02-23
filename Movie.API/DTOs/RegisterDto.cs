namespace Movie.API.DTOs
{
    public class RegisterDto
    {
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public string? CaptchaToken { get; set; }
    }
}
