    namespace RealTimePollingApp.Models
    {
        public class Poll
        {
            public int Id { get; set; } 
            public string Title { get; set; }
            public string Description { get; set; } 
            public List<string> Options { get; set; } 
        }
    }
