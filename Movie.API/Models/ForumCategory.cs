using Movie.API.Models.Enums;

namespace Movie.API.Models
{
    public class ForumCategory
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public TierListStatus Status { get; set; } = TierListStatus.Pending;
        public int? ProposedByUserId { get; set; } 
        public User? ProposedByUser { get; set; }
        public ICollection<ForumTopic> Topics { get; set; } = new List<ForumTopic>();
    }
}