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
        public List<TierConfigDto>? TiersConfig { get; set; }
    }

    public class EditTierListDto
    {
        [Required(ErrorMessage = "Title is required")]
        [MaxLength(200, ErrorMessage = "Title must not exceed 200 characters")]
        public string? Title { get; set; }

        [MaxLength(1000, ErrorMessage = "Description must not exceed 1000 characters")]
        public string? Description { get; set; }

        public List<TierListItemInputDto> Items { get; set; } = new List<TierListItemInputDto>();
        public List<TierConfigDto>? TiersConfig { get; set; }
    }

    public class TierConfigDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Color { get; set; }
    }

    public class TierListItemInputDto
    {
        [Required]
        public int MovieId { get; set; }

        [Required]
        public string? Tier { get; set; }

        public int Position { get; set; }
    }
}
