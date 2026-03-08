namespace Movie.API.Models
{
    public class Franchise
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; 
        public string? Description { get; set; }

        public List<MovieEntity> Movies { get; set; } = new();
    }
}
