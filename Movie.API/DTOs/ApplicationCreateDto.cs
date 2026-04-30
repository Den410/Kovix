using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class ApplicationCreateDto
    {
        [Required]
        [MinLength(20, ErrorMessage = "Мотивація має містити хоча б 20 символів")]
        [MaxLength(500)]
        public string MotivationText { get; set; } = string.Empty;
    }
}