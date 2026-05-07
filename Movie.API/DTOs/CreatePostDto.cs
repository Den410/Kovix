using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class CreatePostDto
    {
        [Required]
        public string Content { get; set; } = string.Empty;
    }
}
