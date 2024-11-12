namespace RealTimePollingApp.Models
{
    public class Vote
    {
        public int Id { get; set; } // Oy ID'si
        public int PollId { get; set; } // Hangi ankete ait olduğu
        public string SelectedOption { get; set; } // Seçilen seçenek
    }

}
