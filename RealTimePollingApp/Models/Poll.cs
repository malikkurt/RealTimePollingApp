namespace RealTimePollingApp.Models
{
    public class Poll
    {
        public int Id { get; set; } // Anketin ID'si
        public string Title { get; set; } // Anket Başlığı
        public string Description { get; set; } // Anket Açıklaması
        public List<string> Options { get; set; } // Oy Seçenekleri
    }
}
