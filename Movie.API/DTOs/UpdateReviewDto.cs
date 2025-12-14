using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class UpdateReviewDto
    {
        [Range(1, 10, ErrorMessage = "Оцінка має бути від 1 до 10")]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }
    }
}
