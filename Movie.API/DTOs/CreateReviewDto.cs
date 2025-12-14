using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class CreateReviewDto
    {
        [Required]
        public int MovieId { get; set; }

        [Range(1, 10, ErrorMessage = "Оцінка має бути від 1 до 10")]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }
    }
}
