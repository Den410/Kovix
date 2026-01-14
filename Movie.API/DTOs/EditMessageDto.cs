using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class EditMessageDto
    {
        [Required]
        [StringLength(1000, MinimumLength = 1)]
        public string Content { get; set; } = string.Empty;
    }
}
