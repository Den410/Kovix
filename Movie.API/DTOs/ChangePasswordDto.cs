using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class ChangePasswordDto
    {
        [Required]
        public string? CurrentPassword { get; set; }

        [Required]
        [MinLength(6)]
        public string? NewPassword { get; set; }
    }
}
