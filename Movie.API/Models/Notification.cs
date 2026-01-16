using Movie.API.Models;
using System.ComponentModel.DataAnnotations.Schema;

public class Notification
{
    public int Id { get; set; }

    public int UserId { get; set; }
    [ForeignKey("UserId")]
    public User? User { get; set; }

    public string? Message { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}