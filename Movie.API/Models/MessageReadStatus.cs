namespace Movie.API.Models
{
    public class MessageReadStatus
    {
        public int Id { get; set; }
        public int MessageId { get; set; }
        public int UserId { get; set; }
        public bool IsRead { get; set; } = false;
    }
}