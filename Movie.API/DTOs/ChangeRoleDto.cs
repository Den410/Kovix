using System.ComponentModel.DataAnnotations;

namespace Movie.API.DTOs
{
    public class ChangeRoleDto
    {
        [Required]
        public string NewRole { get; set; } = string.Empty;
    }
}