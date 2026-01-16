using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class ReportDto
    {
        [Required(ErrorMessage = "ReportedUserId обов'язковий")]
        public int ReportedUserId { get; set; }

        public int? MessageId { get; set; } 

        public string? Content { get; set; }

        [Required(ErrorMessage = "Reason обов'язковий")]
        public string Reason { get; set; } = null!;
    }
}
