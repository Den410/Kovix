using Movie.API.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class ModerateTierListDto
    {
        [Required]
        public TierListStatus Status { get; set; }

        [MaxLength(500, ErrorMessage = "Admin comment must not exceed 500 characters")]
        public string? AdminComment { get; set; }
    }
}