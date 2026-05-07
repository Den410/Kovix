using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class CreateTopicDto
    {
        [Required]
        public int CategoryId { get; set; }
        [Required, MaxLength(150)]
        public string Title { get; set; } = string.Empty;
        [Required]
        public string FirstPostContent { get; set; } = string.Empty; 
    }
}
