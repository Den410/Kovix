using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string? Email { get; set; }
    }
}
