namespace RealTimePollingApp.Models
{
    public class Vote
    {
        public int Id { get; set; } 
        public int PollId { get; set; }
        public string SelectedOption { get; set; } 
    }

}
