using Microsoft.AspNetCore.SignalR;

public class PollHub : Hub
{
    public async Task CastVote(string pollId, string option)
    {
        // Burada oy bilgisini alıp veritabanına kaydedeceğiz
        // Ve tüm kullanıcılarla anında paylaşacağız
        await Clients.All.SendAsync("ReceiveVote", pollId, option);
    }
}
