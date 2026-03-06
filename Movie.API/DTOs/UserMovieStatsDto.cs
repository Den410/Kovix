namespace Movie.API.DTOs
{
    public class UserMovieStatsDto
    {
        public int PlanToWatchCount { get; set; }
        public double PlanToWatchAvg { get; set; }

        public int WatchingCount { get; set; }
        public double WatchingAvg { get; set; }

        public int CompletedCount { get; set; }
        public double CompletedAvg { get; set; }

        public int DroppedCount { get; set; }
        public double DroppedAvg { get; set; }

        public int TotalCount { get; set; }
    }
}
