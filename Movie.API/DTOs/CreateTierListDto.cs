using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class CreateTierListDto
    {
        [Required(ErrorMessage = "Title is required")]
        [MaxLength(200, ErrorMessage = "Title must not exceed 200 characters")]
        public string? Title { get; set; }

        [MaxLength(1000, ErrorMessage = "Description must not exceed 1000 characters")]
        public string? Description { get; set; }

        public List<TierListItemInputDto> Items { get; set; } = new List<TierListItemInputDto>();
    }

    public class EditTierListDto
    {
        [Required(ErrorMessage = "Title is required")]
        [MaxLength(200, ErrorMessage = "Title must not exceed 200 characters")]
        public string? Title { get; set; }

        [MaxLength(1000, ErrorMessage = "Description must not exceed 1000 characters")]
        public string? Description { get; set; }

        public List<TierListItemInputDto> Items { get; set; } = new List<TierListItemInputDto>();
    }

    public class TierListItemInputDto
    {
        [Required]
        public int MovieId { get; set; }

        [Required]
        [RegularExpression("^[A-F]$|^S$", ErrorMessage = "Tier must be S, A, B, C, D, or F")]
        public string? Tier { get; set; }

        public int Position { get; set; }
    }
}
