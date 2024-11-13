using Microsoft.AspNetCore.SignalR;

public class PollHub : Hub
{
    public async Task BroadcastResults(int pollId, object results)
    {
        // Tüm bağlı kullanıcılara oy sonuçlarını gönder
        await Clients.All.SendAsync("ReceiveResults", pollId, results);
    }
}